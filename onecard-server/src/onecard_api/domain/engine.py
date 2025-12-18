from __future__ import annotations

from typing import Any, Iterable

from .state import create_game_state, initialize_game_state, start_game
from .transitions import transition_game_state
from .types import GameSettings, GameState, PokerCard

GameAction = dict[str, Any]


def create_initial_state(settings: GameSettings) -> GameState:
    return create_game_state(settings)


def create_waiting_state(settings: GameSettings) -> GameState:
    return initialize_game_state(settings)


def create_started_state(settings: GameSettings) -> GameState:
    return start_game(initialize_game_state(settings))


def step(state: GameState, action: GameAction) -> dict[str, Any]:
    next_state = transition_game_state(state, action)
    done = next_state.get("gameStatus") == "finished"
    return {"state": next_state, "done": done, "info": {"action": action}}


def apply_actions(state: GameState, actions: Iterable[GameAction]) -> dict[str, Any]:
    result: dict[str, Any] = {"state": state, "done": False}
    for action in actions:
        if result["done"]:
            break
        result = step(result["state"], action)
    return result


def start_game_action() -> GameAction:
    return {"type": "START_GAME"}


def play_card_action(player_index: int, card_index: int) -> GameAction:
    return {"type": "PLAY_CARD", "payload": {"playerIndex": player_index, "cardIndex": card_index}}


def draw_card_action(amount: int) -> GameAction:
    return {"type": "DRAW_CARD", "payload": {"amount": amount}}


def next_turn_action() -> GameAction:
    return {"type": "NEXT_TURN"}


def apply_special_effect_action(effect_card: PokerCard) -> GameAction:
    return {"type": "APPLY_SPECIAL_EFFECT", "payload": {"effectCard": effect_card}}


def end_game_action(winner_index: int) -> GameAction:
    return {"type": "END_GAME", "payload": {"winnerIndex": winner_index}}
