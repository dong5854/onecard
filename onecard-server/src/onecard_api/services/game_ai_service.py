from __future__ import annotations

import json
import logging
from typing import Any

from onecard_api.domain.engine import (
    GameAction,
    apply_special_effect_action,
    draw_card_action,
    next_turn_action,
    play_card_action,
)
from onecard_api.domain.players import find_playable_card_brute_force
from onecard_api.domain.types import GameState, Player, PokerCard
from onecard_api.services.game_engine_service import GameEngineService
from onecard_api.services.onnx_policy_service import OnnxPolicyService

logger = logging.getLogger("onecard_api.game_ai")


class GameAiService:
    def __init__(
        self,
        game_engine: GameEngineService,
        onnx_policy_service: OnnxPolicyService,
    ) -> None:
        self._game_engine = game_engine
        self._onnx_policy_service = onnx_policy_service

    async def play_while_ai_turn(
        self, state: GameState, context: dict[str, Any] | None = None
    ) -> dict | None:
        if state["settings"]["mode"] != "single" or not self.is_ai_turn(state):
            return None

        if state["settings"]["difficulty"] == "medium":
            return await self._play_with_onnx(state, context)

        turn_result = self._execute_turn(state, context)
        if not turn_result:
            return None

        return {
            "state": turn_result["state"],
            "done": turn_result["state"]["gameStatus"] == "finished",
            "info": {"aiActions": turn_result["actions"]},
        }

    def _execute_turn(
        self, state: GameState, context: dict[str, Any] | None = None
    ) -> dict | None:
        player = state["players"][state["currentPlayerIndex"]]
        if not player.get("isAI"):
            return None

        current_state = state
        last_result: dict | None = None
        actions: list[GameAction] = []

        top_card = current_state["discardPile"][0] if current_state["discardPile"] else None
        card_to_play = (
            find_playable_card_brute_force(
                player["hand"], top_card, current_state["damage"]
            )
            if top_card
            else None
        )

        if card_to_play:
            playable_index = next(
                (idx for idx, c in enumerate(player["hand"]) if c["id"] == card_to_play["id"]),
                -1,
            )
            play_outcome = self._apply_action(
                current_state,
                play_card_action(current_state["currentPlayerIndex"], playable_index),
                context,
            )
            current_state = play_outcome["state"]
            last_result = play_outcome["result"]
            self._push_action(actions, play_outcome["result"])

            if self._has_special_effect(card_to_play):
                effect_outcome = self._apply_action(
                    current_state, apply_special_effect_action(card_to_play), context
                )
                current_state = effect_outcome["state"]
                last_result = effect_outcome["result"]
                self._push_action(actions, effect_outcome["result"])
        else:
            draw_outcome = self._apply_action(
                current_state,
                draw_card_action(max(1, current_state["damage"])),
                context,
            )
            current_state = draw_outcome["state"]
            last_result = draw_outcome["result"]
            self._push_action(actions, draw_outcome["result"])

        if current_state["gameStatus"] != "finished":
            next_outcome = self._apply_action(current_state, next_turn_action(), context)
            current_state = next_outcome["state"]
            last_result = next_outcome["result"]
            self._push_action(actions, next_outcome["result"])

        return {"state": current_state, "actions": actions, "result": last_result}

    def _apply_action(
        self,
        state: GameState,
        action: GameAction,
        context: dict[str, Any] | None = None,
    ) -> dict:
        self._log_ai_action(action, state["players"][state["currentPlayerIndex"]], context)
        result = self._game_engine.step(state, action)
        return {"state": result["state"], "result": result}

    def _push_action(self, actions: list[GameAction], result: dict) -> None:
        info_action = (result.get("info") or {}).get("action")
        if info_action:
            actions.append(info_action)  # type: ignore[arg-type]

    def _log_ai_action(
        self, action: GameAction, actor: Player | None, context: dict[str, Any] | None
    ) -> None:
        if not actor or not actor.get("isAI"):
            return
        metadata = {
            "event": "ai-action",
            "gameId": context.get("gameId") if context else None,
            "playerId": actor.get("id"),
            "playerName": actor.get("name"),
            "actionType": action.get("type"),
            "payload": action.get("payload") if isinstance(action, dict) else None,
        }
        try:
            serialized = json.dumps(metadata, ensure_ascii=False)
        except Exception:
            serialized = str(metadata)
        logger.info("[AI] %s", serialized)

    def _has_special_effect(self, card: PokerCard) -> bool:
        if card.get("isJoker"):
            return True
        special_ranks = {1, 2, 11, 12, 13}
        rank = card.get("rank")
        return rank in special_ranks if rank is not None else False

    async def _play_with_onnx(
        self, state: GameState, context: dict[str, Any] | None = None
    ) -> dict | None:
        try:
            current_state = state
            actions: list[GameAction] = []
            last_result: dict | None = None

            prediction = await self._onnx_policy_service.predict_action(current_state)
            payload = prediction["payload"]
            action_index = prediction["actionIndex"]
            is_draw = payload.get("type") == "DRAW_CARD"
            amount = payload.get("amount") or 1
            player_index = 0 if is_draw else payload.get("playerIndex", 0)
            card_index = 0 if is_draw else payload.get("cardIndex", 0)

            first_action: GameAction = (
                draw_card_action(int(amount))
                if is_draw
                else play_card_action(int(player_index), int(card_index))
            )

            logger.info(
                "[AI][ONNX] actionIndex=%s payload=%s",
                action_index,
                json.dumps(payload, ensure_ascii=False),
            )

            first_outcome = self._apply_action(current_state, first_action, context)
            current_state = first_outcome["state"]
            last_result = first_outcome["result"]
            self._push_action(actions, first_outcome["result"])

            if not is_draw:
                player = state["players"][state["currentPlayerIndex"]]
                card_to_play = (
                    player["hand"][card_index]
                    if 0 <= int(card_index) < len(player["hand"])
                    else None
                )
                if card_to_play and self._has_special_effect(card_to_play):
                    effect_outcome = self._apply_action(
                        current_state, apply_special_effect_action(card_to_play), context
                    )
                    current_state = effect_outcome["state"]
                    last_result = effect_outcome["result"]
                    self._push_action(actions, effect_outcome["result"])

            if current_state["gameStatus"] != "finished":
                next_outcome = self._apply_action(
                    current_state, next_turn_action(), context
                )
                current_state = next_outcome["state"]
                last_result = next_outcome["result"]
                self._push_action(actions, next_outcome["result"])

            return {
                "state": current_state,
                "done": current_state["gameStatus"] == "finished",
                "info": {"aiActions": actions, "source": "onnx"},
            }
        except Exception as error:  # broad catch to match JS fallback behaviour
            logger.error(
                "[AI][ONNX] fallback to rule-based due to: %s",
                self._describe_onnx_error(error),
            )
            fallback = self._execute_turn(state, context)
            if fallback:
                return {
                    "state": fallback["state"],
                    "done": fallback["state"]["gameStatus"] == "finished",
                    "info": {
                        "aiActions": fallback["actions"],
                        "source": "fallback",
                        "reason": self._describe_onnx_error(error),
                    },
                }
            return None

    def _describe_onnx_error(self, error: Exception) -> str:
        return f"{error.__class__.__name__}: {error}"

    def is_ai_turn(self, state: GameState) -> bool:
        player = state["players"][state["currentPlayerIndex"]]
        return bool(player.get("isAI"))
