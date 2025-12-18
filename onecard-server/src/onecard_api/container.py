from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from onecard_api.domain.constants import DEFAULT_GAME_SETTINGS
from onecard_api.services.game_ai_service import GameAiService
from onecard_api.services.game_engine_service import GameEngineService
from onecard_api.services.game_service import GameService
from onecard_api.services.game_state_store import GameStateStore
from onecard_api.services.onnx_policy_service import OnnxPolicyService


class ServiceContainer:
    """Lazily constructed service graph for dependency injection."""

    def __init__(self, model_dir: Optional[str | Path] = None) -> None:
        self.game_engine_service = GameEngineService()
        self.onnx_policy_service = OnnxPolicyService(model_dir=model_dir)
        self.game_state_store = GameStateStore(
            DEFAULT_GAME_SETTINGS, self.game_engine_service
        )
        self.game_ai_service = GameAiService(
            self.game_engine_service, self.onnx_policy_service
        )
        self.game_service = GameService(
            self.game_state_store,
            self.game_engine_service,
            self.game_ai_service,
        )


@lru_cache(maxsize=1)
def get_container(model_dir: Optional[str | Path] = None) -> ServiceContainer:
    """Cached container builder; override `model_dir` if ONNX assets live elsewhere."""

    return ServiceContainer(model_dir=model_dir)
