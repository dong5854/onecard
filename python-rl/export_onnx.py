"""Stable-Baselines3 모델을 ONNX로 내보내는 스크립트."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import Dict, Tuple

import gymnasium as gym
import torch
from stable_baselines3 import PPO
from stable_baselines3.common.policies import ActorCriticPolicy

from gym_env import OneCardEnv


@dataclass
class ExportSettings:
    mode: str
    numberOfPlayers: int
    difficulty: str
    includeJokers: bool
    maxHandSize: int
    initHandSize: int

    def to_dict(self) -> Dict[str, object]:
        return asdict(self)


class PolicyExporter(torch.nn.Module):
    """PPO Actor-Critic 정책에서 로짓/가치를 직접 추출하기 위한 래퍼."""

    def __init__(self, policy: ActorCriticPolicy) -> None:
        super().__init__()
        self.policy = policy

    def forward(self, obs: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        features = self.policy.extract_features(obs)
        latent_pi, latent_vf = self.policy.mlp_extractor(features)
        action_logits = self.policy.action_net(latent_pi)
        state_value = self.policy.value_net(latent_vf)
        return action_logits, state_value


def case_suffix(players: int, include_jokers: bool) -> str:
    return f"p{players}_joker{'on' if include_jokers else 'off'}"


def export_model_to_onnx(
    *,
    model_path: Path,
    output_path: Path,
    endpoint: str,
    players: int,
    difficulty: str,
    include_jokers: bool,
    max_hand_size: int,
    init_hand_size: int,
    opset: int,
) -> None:
    export_settings = ExportSettings(
        mode="single",
        numberOfPlayers=players,
        difficulty=difficulty,
        includeJokers=include_jokers,
        maxHandSize=max_hand_size,
        initHandSize=init_hand_size,
    )
    env = OneCardEnv(endpoint=endpoint, settings=export_settings.to_dict())
    try:
        obs_space = env.observation_space
        if not isinstance(obs_space, gym.spaces.Box):
            raise TypeError("Observation space must be Box to compute observation_dim.")
        observation_dim = obs_space.shape[0]

        model = PPO.load(model_path, env=env)
        model.policy.eval()

        wrapper = PolicyExporter(model.policy)
        dummy = torch.zeros((1, observation_dim), dtype=torch.float32)

        output_path.parent.mkdir(parents=True, exist_ok=True)
        torch.onnx.export(
            wrapper,
            (dummy,),
            output_path,
            input_names=["observation"],
            output_names=["action_logits", "state_value"],
            opset_version=opset,
            dynamic_axes={
                "observation": {0: "batch"},
                "action_logits": {0: "batch"},
                "state_value": {0: "batch"},
            },
        )

        action_space = env.action_space
        if not isinstance(action_space, gym.spaces.Discrete):
            raise TypeError("Action space must be Discrete to compute action dimension.")
        metadata = {
            "observation_dim": int(observation_dim),
            "action_dim": int(action_space.n),
            "settings": export_settings.to_dict(),
            "opset_version": int(opset),
        }
        metadata_path = output_path.with_suffix(output_path.suffix + ".json")
        metadata_path.write_text(json.dumps(metadata, indent=2), encoding="utf-8")
    finally:
        env.close()
    print(f"Exported ONNX model to {output_path}")
    print(f"Wrote metadata to {metadata_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export PPO model (Stable-Baselines3) to ONNX"
    )
    parser.add_argument(
        "--model-path",
        default="ppo-onecard.zip",
        help="단일 추출 시 사용할 SB3 모델 경로",
    )
    parser.add_argument(
        "--output-path",
        default="ppo-onecard.onnx",
        help="단일 추출 시 저장할 ONNX 파일",
    )
    parser.add_argument(
        "--endpoint",
        default="http://localhost:3000",
        help="oncard-server REST URL (관측 차원 산출용)",
    )
    parser.add_argument(
        "--players",
        type=int,
        default=2,
        help="플레이어 수 (에이전트 포함)",
    )
    parser.add_argument(
        "--difficulty",
        choices=["easy", "medium", "hard"],
        default="easy",
        help="서버 AI 난이도",
    )
    parser.add_argument(
        "--include-jokers",
        action="store_true",
        help="조커 포함 여부",
    )
    parser.add_argument(
        "--max-hand-size",
        type=int,
        default=15,
        help="손패 최대 크기",
    )
    parser.add_argument(
        "--init-hand-size",
        type=int,
        default=5,
        help="시작 손패 크기",
    )
    parser.add_argument(
        "--opset",
        type=int,
        default=17,
        help="ONNX opset 버전",
    )
    parser.add_argument(
        "--models-dir",
        default="models",
        help="배치 모드에서 SB3 모델(.zip)이 위치한 폴더",
    )
    parser.add_argument(
        "--onnx-dir",
        default="onnx_exports",
        help="배치 모드에서 ONNX 파일을 저장할 폴더",
    )
    parser.add_argument(
        "--all-cases",
        action="store_true",
        help="플레이어 2~4 & 조커 포함/미포함 전체 조합을 순차로 내보냅니다.",
    )
    return parser.parse_args()


def export_all_cases(args: argparse.Namespace) -> None:
    models_dir = Path(args.models_dir)
    onnx_dir = Path(args.onnx_dir)
    onnx_dir.mkdir(parents=True, exist_ok=True)
    for players in (2, 3, 4):
        for include_jokers in (False, True):
            suffix = case_suffix(players, include_jokers)
            model_path = models_dir / f"ppo-onecard_{suffix}.zip"
            output_path = onnx_dir / f"ppo-onecard_{suffix}.onnx"
            if not model_path.exists():
                raise FileNotFoundError(
                    f"모델 파일을 찾을 수 없습니다: {model_path}. 먼저 train_all_cases.py로 학습해주세요."
                )
            print(f"\n=== Exporting {suffix} ===")
            export_model_to_onnx(
                model_path=model_path,
                output_path=output_path,
                endpoint=args.endpoint,
                players=players,
                difficulty=args.difficulty,
                include_jokers=include_jokers,
                max_hand_size=args.max_hand_size,
                init_hand_size=args.init_hand_size,
                opset=args.opset,
            )


def main() -> None:
    args = parse_args()
    if args.all_cases:
        export_all_cases(args)
        return

    export_model_to_onnx(
        model_path=Path(args.model_path),
        output_path=Path(args.output_path),
        endpoint=args.endpoint,
        players=args.players,
        difficulty=args.difficulty,
        include_jokers=args.include_jokers,
        max_hand_size=args.max_hand_size,
        init_hand_size=args.init_hand_size,
        opset=args.opset,
    )


if __name__ == "__main__":
    main()
