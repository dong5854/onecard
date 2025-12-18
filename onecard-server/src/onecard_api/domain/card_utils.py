from __future__ import annotations

import random
import uuid
from typing import Iterable

from .types import Direction, GameState, Player, PokerCard, RankValue, SuitValue

SUIT_VALUES: tuple[SuitValue, ...] = ("hearts", "diamonds", "clubs", "spades")
RANK_VALUES: tuple[RankValue, ...] = tuple(range(1, 14))  # 1~13


def create_deck(include_jokers: bool) -> list[PokerCard]:
    deck: list[PokerCard] = [
        {
            "id": str(uuid.uuid4()),
            "suit": suit,
            "rank": rank,
            "isJoker": False,
            "isFlipped": True,
            "draggable": False,
        }
        for suit in SUIT_VALUES
        for rank in RANK_VALUES
    ]

    if include_jokers:
        deck.append(
            {
                "id": str(uuid.uuid4()),
                "isJoker": True,
                "isFlipped": True,
                "draggable": False,
            }
        )
        deck.append(
            {
                "id": str(uuid.uuid4()),
                "isJoker": True,
                "isFlipped": True,
                "draggable": False,
            }
        )

    return deck


def shuffle_deck(deck: Iterable[PokerCard]) -> list[PokerCard]:
    shuffled = list(deck)
    random.shuffle(shuffled)
    return shuffled


def refill_deck(
    current_deck: list[PokerCard], discard_pile: list[PokerCard]
) -> dict[str, list[PokerCard]]:
    if not discard_pile:
        return {"new_deck": list(current_deck), "new_discard_pile": []}

    cards_to_shuffle = [*current_deck, *discard_pile[1:]]
    shuffled_deck = shuffle_deck(cards_to_shuffle)
    new_discard_pile = [discard_pile[0]]
    return {"new_deck": shuffled_deck, "new_discard_pile": new_discard_pile}


def deal_cards(
    players: list[Player], deck: list[PokerCard], init_hand_size: int
) -> tuple[list[Player], list[PokerCard]]:
    updated_players: list[Player] = []
    for idx, player in enumerate(players):
        start = idx * init_hand_size
        end = start + init_hand_size
        updated_players.append(
            {**player, "hand": list(deck[start:end])}  # copy slice
        )

    updated_deck = list(deck[len(players) * init_hand_size :])
    return updated_players, updated_deck


def is_able_to_block(played_card: PokerCard, top_card: PokerCard) -> bool:
    if top_card.get("rank") == 2:
        return played_card.get("rank") == 2 or (
            played_card.get("suit") == top_card.get("suit")
            and played_card.get("rank") == 1
        )
    if top_card.get("rank") == 1:
        return played_card.get("rank") == 1
    return bool(played_card.get("isJoker"))


def attack_value(card: PokerCard) -> int:
    if card.get("rank") == 2:
        return 2
    if card.get("rank") == 1:
        return 5
    if card.get("isJoker"):
        return 7
    return 0


def change_direction(card: PokerCard, cur_direction: Direction) -> Direction:
    if card.get("rank") == 12:
        return "counterclockwise" if cur_direction == "clockwise" else "clockwise"
    return cur_direction


def turn_special_effect(card: PokerCard, state: GameState) -> int:
    if card.get("rank") == 11:
        return get_next_player_index(state)
    if card.get("rank") == 13:
        return get_prev_player_index(state)
    return state["currentPlayerIndex"]


def is_valid_play(
    played_card: PokerCard, top_card: PokerCard, damage: int
) -> bool:
    if played_card.get("isJoker"):
        return True
    if damage > 0:
        return is_able_to_block(played_card, top_card)
    if top_card.get("isJoker"):
        return True

    if played_card.get("rank") is None or played_card.get("suit") is None:
        return False
    if top_card.get("rank") is None or top_card.get("suit") is None:
        return False

    return played_card.get("rank") == top_card.get("rank") or played_card.get(
        "suit"
    ) == top_card.get("suit")


def check_winner(players: Iterable[Player]) -> Player | None:
    for player in players:
        if len(player.get("hand", [])) == 0:
            return player
    return None


def get_next_player_index(state: GameState) -> int:
    player_count = len(state["players"])
    if state["direction"] == "clockwise":
        return (state["currentPlayerIndex"] + 1) % player_count
    return (state["currentPlayerIndex"] - 1 + player_count) % player_count


def get_prev_player_index(state: GameState) -> int:
    player_count = len(state["players"])
    if state["direction"] == "clockwise":
        return (state["currentPlayerIndex"] - 1 + player_count) % player_count
    return (state["currentPlayerIndex"] + 1) % player_count
