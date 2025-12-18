from __future__ import annotations

from fastapi import HTTPException, status

from onecard_api.domain.card_utils import is_valid_play
from onecard_api.domain.engine import GameAction
from onecard_api.domain.types import GameState
from onecard_api.services.game_ai_service import GameAiService
from onecard_api.services.game_engine_service import GameEngineService
from onecard_api.services.game_state_store import GameSessionRecord, GameStateStore


class GameService:
    def __init__(
        self,
        game_state_store: GameStateStore,
        game_engine: GameEngineService,
        game_ai_service: GameAiService,
    ) -> None:
        self._game_state_store = game_state_store
        self._game_engine = game_engine
        self._game_ai_service = game_ai_service

    def list_games(self) -> list[dict]:
        return [
            {
                "id": record["id"],
                "createdAt": record["created_at"].isoformat(),
                "updatedAt": record["updated_at"].isoformat(),
                "gameStatus": record["state"]["gameStatus"],
                "currentPlayerIndex": record["state"]["currentPlayerIndex"],
            }
            for record in self._game_state_store.list()
        ]

    def create_game(self, settings: dict | None = None) -> dict:
        record = self._game_state_store.create(settings)
        return self._to_resource(record)

    def get_game(self, game_id: str) -> dict:
        record = self._find_game_or_throw(game_id)
        return self._to_resource(record)

    def apply_action(self, game_id: str, action_payload: dict | None) -> dict:
        if action_payload is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Action payload is required",
            )
        record = self._find_game_or_throw(game_id)

        if (
            record["state"]["gameStatus"] == "waiting"
            and action_payload.get("type") != "START_GAME"
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="게임이 아직 시작되지 않았습니다.",
            )

        if action_payload.get("type") == "PLAY_CARD":
            self._assert_playable_card(record["state"], action_payload)

        action: GameAction = self._game_engine.build_action(action_payload)
        result = self._game_engine.step(record["state"], action)
        self._game_state_store.update_state(game_id, result["state"])
        return result

    async def execute_ai_turn(self, game_id: str) -> dict:
        record = self._find_game_or_throw(game_id)
        current_state: GameState = record["state"]
        if current_state["gameStatus"] != "playing":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="게임이 아직 시작되지 않았습니다.",
            )
        if not self._game_ai_service.is_ai_turn(current_state):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="현재 차례는 AI가 아닙니다.",
            )

        ai_result = await self._game_ai_service.play_while_ai_turn(
            current_state, {"gameId": game_id}
        )
        if ai_result is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="AI가 수행할 수 있는 행동이 없습니다.",
            )
        self._game_state_store.update_state(game_id, ai_result["state"])
        return ai_result

    def delete_game(self, game_id: str) -> None:
        deleted = self._game_state_store.delete(game_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Game {game_id} not found",
            )

    def _find_game_or_throw(self, game_id: str) -> GameSessionRecord:
        record = self._game_state_store.find(game_id)
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Game {game_id} not found",
            )
        return record

    def _to_resource(self, record: GameSessionRecord) -> dict:
        return {
            "id": record["id"],
            "state": record["state"],
            "createdAt": record["created_at"].isoformat(),
            "updatedAt": record["updated_at"].isoformat(),
        }

    def _assert_playable_card(self, state: GameState, payload: dict) -> None:
        player_index = payload.get("playerIndex", -1)
        card_index = payload.get("cardIndex", -1)

        if not isinstance(player_index, int) or player_index < 0 or player_index >= len(state["players"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="잘못된 playerIndex 입니다.",
            )

        hand = state["players"][player_index]["hand"]
        if not isinstance(card_index, int) or card_index < 0 or card_index >= len(hand):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="잘못된 cardIndex 입니다.",
            )

        if len(state["discardPile"]) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="discardPile 이 비어 있습니다. 게임 상태를 확인하세요.",
            )

        played_card = hand[card_index]
        top_card = state["discardPile"][0]
        damage = state["damage"]
        if not is_valid_play(played_card, top_card, damage):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="규칙에 맞지 않는 카드입니다.",
            )
