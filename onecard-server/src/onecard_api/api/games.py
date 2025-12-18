from __future__ import annotations

from typing import Any
from uuid import UUID

from fastapi import APIRouter, Body, Depends, Response, status

from onecard_api.api.deps import get_game_service
from onecard_api.api.schemas import ApplyGameActionDto, CreateGameDto
from onecard_api.services.game_service import GameService

router = APIRouter(prefix="/games", tags=["games"])


@router.get("")
def list_games(game_service: GameService = Depends(get_game_service)) -> list[dict]:
    return game_service.list_games()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_game(
    body: CreateGameDto | None = Body(default=None),
    game_service: GameService = Depends(get_game_service),
) -> dict:
    settings = body.settings.model_dump(exclude_none=True) if body and body.settings else None
    return game_service.create_game(settings)


@router.get("/{game_id}")
def get_game(
    game_id: UUID, game_service: GameService = Depends(get_game_service)
) -> dict:
    return game_service.get_game(str(game_id))


@router.patch("/{game_id}")
def apply_action(
    game_id: UUID,
    body: ApplyGameActionDto = Body(...),
    game_service: GameService = Depends(get_game_service),
) -> dict:
    action_payload = body.action.model_dump(exclude_none=True)
    return game_service.apply_action(str(game_id), action_payload)


@router.post("/{game_id}/ai-turns")
async def execute_ai_turn(
    game_id: UUID, game_service: GameService = Depends(get_game_service)
) -> dict:
    return await game_service.execute_ai_turn(str(game_id))


@router.delete("/{game_id}", status_code=status.HTTP_200_OK)
def delete_game(
    game_id: UUID, game_service: GameService = Depends(get_game_service)
) -> Response:
    game_service.delete_game(str(game_id))
    return Response(status_code=status.HTTP_200_OK)
