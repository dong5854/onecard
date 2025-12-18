from __future__ import annotations

from .card_utils import is_valid_play
from .types import AIDifficulty, Player, PokerCard


def create_myself(player_id: str, name: str, hand: list[PokerCard]) -> Player:
    return {
        "id": player_id,
        "name": name,
        "hand": hand,
        "isSelf": True,
        "isAI": False,
    }


def create_ai_player(
    player_id: str,
    name: str,
    hand: list[PokerCard],
    difficulty: AIDifficulty,
) -> Player:
    return {
        "id": player_id,
        "name": name,
        "hand": hand,
        "isSelf": False,
        "isAI": True,
        "difficulty": difficulty,
    }


def find_playable_card_brute_force(
    hand: list[PokerCard], top_card: PokerCard, damage: int
) -> PokerCard | None:
    for card in hand:
        if is_valid_play(card, top_card, damage):
            return card
    return None
