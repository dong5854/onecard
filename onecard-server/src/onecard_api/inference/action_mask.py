from __future__ import annotations

from typing import TypedDict

from onecard_api.domain.card_utils import is_valid_play
from onecard_api.domain.types import GameState, PokerCard


class EngineActionPayload(TypedDict, total=False):
    type: str
    playerIndex: int
    cardIndex: int
    amount: int


def build_action_mask(state: GameState, max_hand_size: int) -> list[bool]:
    mask = [False] * (max_hand_size + 1)
    hand: list[PokerCard] = state.get("players", [{}])[0].get("hand", []) if state.get("players") else []

    if not state.get("discardPile"):
        for i in range(min(len(hand), max_hand_size)):
            mask[i] = True
        mask[max_hand_size] = len(hand) < max_hand_size
        return mask

    top_card = state["discardPile"][0]
    damage = state.get("damage", 0)

    for i in range(max_hand_size):
        if i >= len(hand):
            mask[i] = False
            continue
        mask[i] = is_valid_play(hand[i], top_card, damage)

    mask[max_hand_size] = len(hand) < max_hand_size
    return mask


def apply_action_mask(logits: list[float], mask: list[bool]) -> list[float]:
    if len(logits) != len(mask):
        raise ValueError(
            f"logits length {len(logits)} and mask length {len(mask)} mismatch"
        )
    neg_inf = -1e9
    return [v if mask[idx] else neg_inf for idx, v in enumerate(logits)]


def select_action(masked_logits: list[float]) -> int:
    best_idx = 0
    best_val = masked_logits[0]
    for idx, val in enumerate(masked_logits[1:], start=1):
        if val > best_val:
            best_idx = idx
            best_val = val
    if best_val <= -1e8:
        raise ValueError("No valid action after masking")
    return best_idx


def map_action_index_to_payload(
    action_index: int, state: GameState, max_hand_size: int
) -> EngineActionPayload:
    hand: list[PokerCard] = state.get("players", [{}])[0].get("hand", []) if state.get("players") else []
    if action_index == max_hand_size:
        draw_amount = max(1, int(state.get("damage", 0)))
        return {"type": "DRAW_CARD", "amount": draw_amount}

    if action_index < 0 or action_index >= max_hand_size:
        raise ValueError(f"actionIndex {action_index} out of bounds")
    if action_index >= len(hand):
        raise ValueError(
            f"actionIndex {action_index} exceeds hand length {len(hand)}"
        )
    return {"type": "PLAY_CARD", "playerIndex": 0, "cardIndex": action_index}
