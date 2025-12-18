from __future__ import annotations

from fastapi import HTTPException, status

from onecard_api.domain.engine import (
    GameAction,
    apply_special_effect_action,
    create_started_state,
    create_waiting_state,
    draw_card_action,
    end_game_action,
    next_turn_action,
    play_card_action,
    start_game_action,
    step,
)
from onecard_api.domain.types import GameSettings, GameState, PokerCard, RankValue, is_valid_rank, is_valid_suit


class GameEngineService:
    def create_waiting_state(self, settings: GameSettings) -> GameState:
        return create_waiting_state(settings)

    def create_started_state(self, settings: GameSettings) -> GameState:
        return create_started_state(settings)

    def step(self, state: GameState, action: GameAction) -> dict:
        return step(state, action)

    def build_action(self, payload: dict) -> GameAction:
        action_type = payload.get("type")
        if action_type == "START_GAME":
            return start_game_action()
        if action_type == "PLAY_CARD":
            player_index = payload.get("playerIndex")
            card_index = payload.get("cardIndex")
            if player_index is None or card_index is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="PLAY_CARD requires both playerIndex and cardIndex",
                )
            return play_card_action(int(player_index), int(card_index))
        if action_type == "DRAW_CARD":
            amount = int(payload.get("amount") or 1)
            return draw_card_action(amount)
        if action_type == "NEXT_TURN":
            return next_turn_action()
        if action_type == "APPLY_SPECIAL_EFFECT":
            effect_card = payload.get("effectCard")
            if effect_card is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="APPLY_SPECIAL_EFFECT requires an effectCard payload",
                )
            return apply_special_effect_action(self._to_effect_card(effect_card))
        if action_type == "END_GAME":
            winner_index = int(payload.get("winnerIndex") or 0)
            return end_game_action(winner_index)

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported action type: {action_type}",
        )

    def _to_effect_card(self, effect_card: dict) -> PokerCard:
        transformed: PokerCard = {
            "id": effect_card.get("id"),
            "isJoker": bool(effect_card.get("isJoker")),
            "isFlipped": bool(effect_card.get("isFlipped")),
        }
        normalized_rank = self._normalize_rank(effect_card.get("rank"))
        if normalized_rank is not None:
            transformed["rank"] = normalized_rank
        suit = effect_card.get("suit")
        if suit is not None and is_valid_suit(suit):
            transformed["suit"] = suit
        return transformed

    def _normalize_rank(self, rank: object) -> RankValue | None:
        if isinstance(rank, int) and is_valid_rank(rank):
            return rank
        if isinstance(rank, str):
            try:
                parsed = int(rank)
            except ValueError:
                return None
            if is_valid_rank(parsed):
                return parsed
        return None
