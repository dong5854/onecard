from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, Query

from onecard_api.api.deps import get_game_service, get_onnx_policy_service
from onecard_api.api.schemas import OnnxHealthQueryDto
from onecard_api.domain.types import GameSettings
from onecard_api.services.game_service import GameService
from onecard_api.services.onnx_policy_service import OnnxPolicyService

router = APIRouter(
    prefix="/games/{game_id}/onnx-action",
    tags=["onnx-policy"],
)


@router.get("")
async def predict_action(
    game_id: UUID,
    include_logits: bool = Query(
        default=False, alias="includeLogits", description="로그 확률 반환 여부"
    ),
    game_service: GameService = Depends(get_game_service),
    onnx_policy_service: OnnxPolicyService = Depends(get_onnx_policy_service),
) -> dict:
    game = game_service.get_game(str(game_id))
    result = await onnx_policy_service.predict_action(game["state"])
    response = {
        "actionIndex": result["actionIndex"],
        "payload": result["payload"],
    }
    if include_logits:
        response["logits"] = result["logits"]
    return response


@router.get("/health")
async def onnx_health(
    game_id: UUID,  # path parameter kept for parity with NestJS routes
    query: OnnxHealthQueryDto = Depends(),
    onnx_policy_service: OnnxPolicyService = Depends(get_onnx_policy_service),
) -> dict:
    base_settings: GameSettings = {
        "mode": "single",
        "numberOfPlayers": query.players,
        "includeJokers": query.includeJokers,
        "initHandSize": query.initHandSize,
        "maxHandSize": query.maxHandSize,
        "difficulty": query.difficulty or "medium",
    }
    return await onnx_policy_service.check_health(base_settings)
