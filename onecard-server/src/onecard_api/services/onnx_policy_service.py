from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import anyio
import numpy as np
import onnxruntime as ort
from fastapi import HTTPException, status

from onecard_api.domain.types import GameSettings, GameState
from onecard_api.inference.action_mask import (
    EngineActionPayload,
    apply_action_mask,
    build_action_mask,
    map_action_index_to_payload,
    select_action,
)
from onecard_api.inference.observation_encoder import (
    ObservationSpec,
    build_observation_spec,
    encode_observation,
)


@dataclass(frozen=True)
class OnnxMetadata:
    observation_dim: int
    action_dim: int
    settings: GameSettings
    opset_version: int | None = None


@dataclass
class LoadedModel:
    session: ort.InferenceSession
    metadata: OnnxMetadata
    spec: ObservationSpec


class OnnxPolicyService:
    def __init__(self, model_dir: str | Path | None = None) -> None:
        package_root = Path(__file__).resolve().parents[3]
        default_dir = package_root / "assets" / "onnx"
        cwd_fallback = Path.cwd() / "assets" / "onnx"
        resolved_dir = Path(
            model_dir
            or os.getenv("ONNX_MODEL_DIR")
            or (default_dir if default_dir.exists() else cwd_fallback)
        )
        self._model_dir = resolved_dir.expanduser()
        self._cache: dict[str, LoadedModel] = {}

    def _rotate_players_to_current(
        self, players: list[dict], current_index: int, direction: str
    ) -> dict[str, Any]:
        total = len(players)
        step = 1 if direction == "clockwise" else -1
        reordered = [
            players[(current_index + i * step + total) % total] for i in range(total)
        ]
        return {"players": reordered, "currentPlayerIndex": 0}

    def _map_payload_to_original_indices(
        self, payload: EngineActionPayload, original_current_index: int
    ) -> EngineActionPayload:
        mapped = dict(payload)
        if "playerIndex" in mapped:
            mapped["playerIndex"] = original_current_index
        return mapped  # type: ignore[return-value]

    def _build_suffix(self, settings: GameSettings) -> str:
        return f"p{settings['numberOfPlayers']}_joker{'on' if settings['includeJokers'] else 'off'}"

    def _resolve_paths(self, settings: GameSettings) -> tuple[Path, Path]:
        suffix = self._build_suffix(settings)
        model_path = self._model_dir / f"ppo-onecard_{suffix}.onnx"
        metadata_path = model_path.with_suffix(".onnx.json")
        return model_path, metadata_path

    def _read_metadata(self, metadata_path: Path) -> OnnxMetadata:
        try:
            raw = metadata_path.read_text(encoding="utf-8")
            parsed = json.loads(raw)
        except FileNotFoundError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"메타데이터를 읽을 수 없습니다: {metadata_path}",
            )
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"메타데이터 형식이 올바르지 않습니다: {metadata_path}",
            )

        if (
            "settings" not in parsed
            or not isinstance(parsed.get("observation_dim"), int)
            or not isinstance(parsed.get("action_dim"), int)
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="메타데이터 스키마가 올바르지 않습니다.",
            )

        return OnnxMetadata(
            observation_dim=int(parsed["observation_dim"]),
            action_dim=int(parsed["action_dim"]),
            settings=parsed["settings"],
            opset_version=parsed.get("opset_version"),
        )

    def _assert_settings_compatible(
        self, model_settings: GameSettings, request_settings: GameSettings
    ) -> None:
        keys = [
            "numberOfPlayers",
            "includeJokers",
            "maxHandSize",
            "initHandSize",
            "mode",
            "difficulty",
        ]
        for key in keys:
            if model_settings.get(key) != request_settings.get(key):  # type: ignore[index]
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"모델 설정({key})과 현재 게임 설정이 다릅니다.",
                )

    async def _load_model_if_needed(self, settings: GameSettings) -> LoadedModel:
        suffix = self._build_suffix(settings)
        cached = self._cache.get(suffix)
        if cached:
            return cached

        return await anyio.to_thread.run_sync(self._load_and_cache_model, settings)

    def _load_and_cache_model(self, settings: GameSettings) -> LoadedModel:
        suffix = self._build_suffix(settings)
        if suffix in self._cache:
            return self._cache[suffix]

        model_path, metadata_path = self._resolve_paths(settings)
        metadata = self._read_metadata(metadata_path)
        spec = build_observation_spec(metadata.settings)
        if spec.vectorSize != metadata.observation_dim:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="메타데이터 관측 차원과 스펙이 일치하지 않습니다.",
            )
        if metadata.action_dim != spec.maxHandSize + 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="메타데이터 행동 차원과 maxHandSize+1이 일치하지 않습니다.",
            )

        try:
            session = ort.InferenceSession(str(model_path))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ONNX 모델을 로드할 수 없습니다: {model_path}",
            )

        loaded = LoadedModel(session=session, metadata=metadata, spec=spec)
        self._cache[suffix] = loaded
        return loaded

    async def check_health(self, settings: GameSettings) -> dict[str, Any]:
        loaded = await self._load_model_if_needed(settings)
        return {
            "suffix": self._build_suffix(settings),
            "observationDim": loaded.metadata.observation_dim,
            "actionDim": loaded.metadata.action_dim,
            "settings": loaded.metadata.settings,
        }

    async def predict_action(self, state: GameState) -> dict[str, Any]:
        loaded = await self._load_model_if_needed(state["settings"])
        self._assert_settings_compatible(loaded.metadata.settings, state["settings"])

        normalized_state: GameState = {
            **state,
            **self._rotate_players_to_current(
                state["players"], state["currentPlayerIndex"], state["direction"]
            ),
        }

        observation = encode_observation(normalized_state, loaded.spec)
        if len(observation) != loaded.metadata.observation_dim:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="관측 차원이 모델과 일치하지 않습니다.",
            )

        mask = build_action_mask(normalized_state, loaded.spec.maxHandSize)
        if len(mask) != loaded.metadata.action_dim:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="행동 마스크 길이가 모델과 일치하지 않습니다.",
            )

        obs_array = np.array(observation, dtype=np.float32).reshape(1, -1)
        try:
            outputs = loaded.session.run(None, {"observation": obs_array})
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ONNX 추론 중 오류가 발생했습니다.",
            )

        if not outputs:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="ONNX 출력이 비어 있습니다.",
            )
        logits_array = outputs[0]
        logits_list = logits_array.ravel().tolist()
        try:
            masked_logits = apply_action_mask(logits_list, mask)
            action_index = select_action(masked_logits)
        except ValueError as exc:  # invalid mask/logits combination
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)
            ) from exc

        payload = self._map_payload_to_original_indices(
            map_action_index_to_payload(
                action_index, normalized_state, loaded.spec.maxHandSize
            ),
            state["currentPlayerIndex"],
        )

        return {
            "actionIndex": action_index,
            "logits": logits_list,
            "payload": payload,
        }
