from __future__ import annotations

from copy import deepcopy
from typing import Any

from .card_utils import (
    attack_value,
    change_direction,
    check_winner,
    get_next_player_index,
    refill_deck,
    turn_special_effect,
)
from .types import GameState, PokerCard

GameAction = dict[str, Any]


def transition_game_state(state: GameState, action: GameAction) -> GameState:
    action_type = action.get("type")
    if action_type == "START_GAME":
        from .state import initialize_game_state, start_game

        return start_game(initialize_game_state(state["settings"]))
    if action_type == "PLAY_CARD":
        payload = action.get("payload") or {}
        return play_card_status(
            state, int(payload.get("playerIndex", -1)), int(payload.get("cardIndex", -1))
        )
    if action_type == "DRAW_CARD":
        payload = action.get("payload") or {}
        amount = int(payload.get("amount", 1))
        return draw_card_status(state, amount)
    if action_type == "NEXT_TURN":
        return next_turn_status(state)
    if action_type == "APPLY_SPECIAL_EFFECT":
        payload = action.get("payload") or {}
        return apply_special_effect_status(state, payload.get("effectCard"))
    if action_type == "END_GAME":
        payload = action.get("payload") or {}
        return end_game_status(state, int(payload.get("winnerIndex", 0)))
    return state


def play_card_status(state: GameState, player_index: int, card_index: int) -> GameState:
    player = state["players"][player_index]
    played_card = player["hand"][card_index]

    updated_players = [
        {**p, "hand": [c for idx, c in enumerate(p["hand"]) if idx != card_index]}
        if idx == player_index
        else p
        for idx, p in enumerate(state["players"])
    ]
    updated_discard_pile = [played_card, *state["discardPile"]]
    winner = check_winner(updated_players)
    if winner:
        return {
            **state,
            "players": updated_players,
            "discardPile": updated_discard_pile,
            "gameStatus": "finished",
            "winner": winner,
        }
    return {
        **state,
        "players": updated_players,
        "discardPile": updated_discard_pile,
    }


def draw_card_status(state: GameState, amount: int) -> GameState:
    updated_state = deepcopy(state)
    max_hand_size = state["settings"]["maxHandSize"]
    for _ in range(amount):
        current_hand_size = len(
            updated_state["players"][updated_state["currentPlayerIndex"]]["hand"]
        )
        if current_hand_size >= max_hand_size:
            return {**updated_state, "damage": 0}

        draw_result = _draw_card(updated_state)
        updated_player, remaining_deck, discard_pile, drawn_card = draw_result

        if drawn_card is None:
            return {
                **updated_state,
                "deck": remaining_deck,
                "discardPile": discard_pile,
                "damage": 0,
            }

        updated_players = _update_players(
            updated_state["players"],
            updated_state["currentPlayerIndex"],
            updated_player,
        )
        updated_state = {
            **updated_state,
            "players": updated_players,
            "deck": remaining_deck,
            "discardPile": discard_pile,
        }

    return {**updated_state, "damage": 0}


def _draw_card(state: GameState) -> tuple[dict, list[PokerCard], list[PokerCard], PokerCard | None]:
    current_player = state["players"][state["currentPlayerIndex"]]
    deck = list(state["deck"])
    discard_pile = list(state["discardPile"])

    if not deck:
        refilled = refill_deck(deck, discard_pile)
        deck = refilled["new_deck"]
        discard_pile = refilled["new_discard_pile"]

    if not deck:
        return current_player, deck, discard_pile, None

    drawn_card, *remaining_deck = deck
    updated_player = {**current_player, "hand": [*current_player["hand"], drawn_card]}
    return updated_player, remaining_deck, discard_pile, drawn_card


def _update_players(
    players: list[dict], current_player_index: int, updated_player: dict
) -> list[dict]:
    return [
        updated_player if idx == current_player_index else p for idx, p in enumerate(players)
    ]


def next_turn_status(state: GameState) -> GameState:
    return {**state, "currentPlayerIndex": get_next_player_index(state)}


def apply_special_effect_status(state: GameState, effect_card: PokerCard | None) -> GameState:
    if effect_card is None:
        return state
    return {
        **state,
        "currentPlayerIndex": turn_special_effect(effect_card, state),
        "direction": change_direction(effect_card, state["direction"]),
        "damage": state["damage"] + attack_value(effect_card),
    }


def end_game_status(state: GameState, winner_index: int) -> GameState:
    return {
        **state,
        "gameStatus": "finished",
        "winner": state["players"][winner_index],
    }
