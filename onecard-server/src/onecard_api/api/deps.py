from __future__ import annotations

from fastapi import Depends

from onecard_api.container import ServiceContainer, get_container
from onecard_api.services.game_ai_service import GameAiService
from onecard_api.services.game_service import GameService
from onecard_api.services.onnx_policy_service import OnnxPolicyService


def get_service_container() -> ServiceContainer:
    return get_container()


def get_game_service(
    container: ServiceContainer = Depends(get_service_container),
) -> GameService:
    return container.game_service


def get_game_ai_service(
    container: ServiceContainer = Depends(get_service_container),
) -> GameAiService:
    return container.game_ai_service


def get_onnx_policy_service(
    container: ServiceContainer = Depends(get_service_container),
) -> OnnxPolicyService:
    return container.onnx_policy_service
