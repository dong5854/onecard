from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

from onecard_api.domain.types import GameSettings, GameState, PokerCard, SuitValue

RANKS: list[int] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
SUITS: list[SuitValue] = ["clubs", "diamonds", "hearts", "spades"]


@dataclass(frozen=True)
class ObservationSpec:
    ranks: Sequence[int]
    suits: Sequence[SuitValue]
    maxHandSize: int
    playerCount: int
    initialDeckSize: int
    vectorSize: int


def _compute_vector_size(spec: ObservationSpec) -> int:
    rank_dim = len(spec.ranks)
    suit_dim = len(spec.suits)
    player_dim = spec.playerCount
    opponent_dim = max(0, spec.playerCount - 1)
    return (
        rank_dim
        + suit_dim
        + 1
        + rank_dim
        + suit_dim
        + 1
        + 1
        + 1
        + player_dim
        + 1
        + opponent_dim
    )


def build_observation_spec(settings: GameSettings) -> ObservationSpec:
    player_count = settings["numberOfPlayers"]
    base_deck_size = 52 + (2 if settings["includeJokers"] else 0)
    initial_deck_size = max(
        1, base_deck_size - player_count * settings["initHandSize"] - 1
    )
    spec = ObservationSpec(
        ranks=RANKS,
        suits=SUITS,
        maxHandSize=settings["maxHandSize"],
        playerCount=player_count,
        initialDeckSize=initial_deck_size,
        vectorSize=0,  # placeholder
    )
    return ObservationSpec(
        ranks=spec.ranks,
        suits=spec.suits,
        maxHandSize=spec.maxHandSize,
        playerCount=spec.playerCount,
        initialDeckSize=spec.initialDeckSize,
        vectorSize=_compute_vector_size(spec),
    )


def _normalize(value: float, max_value: float) -> float:
    return value / max_value if max_value > 0 else 0.0


def encode_observation(
    state: GameState, spec_override: ObservationSpec | None = None
) -> list[float]:
    spec = spec_override or build_observation_spec(state["settings"])
    hand: list[PokerCard] = state.get("players", [{}])[0].get("hand", []) if state.get("players") else []

    rank_counts = [0.0 for _ in spec.ranks]
    suit_counts = [0.0 for _ in spec.suits]
    joker_count = 0.0

    for card in hand:
        if card.get("isJoker"):
            joker_count += 1.0
            continue
        if card.get("rank") in spec.ranks:
            idx = spec.ranks.index(card["rank"])
            rank_counts[idx] += 1.0
        if card.get("suit") in spec.suits:
            idx = spec.suits.index(card["suit"])
            suit_counts[idx] += 1.0

    max_hand = max(1.0, float(spec.maxHandSize))
    rank_counts = [_normalize(val, max_hand) for val in rank_counts]
    suit_counts = [_normalize(val, max_hand) for val in suit_counts]
    joker_feat = [_normalize(joker_count, max_hand)]

    has_top_card = bool(state.get("discardPile"))
    top_card: PokerCard | None = state["discardPile"][0] if has_top_card else None
    top_rank = [0.0 for _ in spec.ranks]
    top_suit = [0.0 for _ in spec.suits]
    top_joker = [1.0 if has_top_card and top_card and top_card.get("isJoker") else 0.0]
    if has_top_card and top_card and not top_card.get("isJoker"):
        if top_card.get("rank") in spec.ranks:
            top_rank[spec.ranks.index(top_card["rank"])] = 1.0
        if top_card.get("suit") in spec.suits:
            top_suit[spec.suits.index(top_card["suit"])] = 1.0

    damage = [
        _normalize(min(float(state.get("damage", 0)), float(spec.maxHandSize)), max_hand)
    ]
    direction = [1.0 if state.get("direction") == "clockwise" else 0.0]

    current_player = [0.0 for _ in range(spec.playerCount)]
    current_index = state.get("currentPlayerIndex", 0)
    if 0 <= int(current_index) < len(current_player):
        current_player[int(current_index)] = 1.0

    deck_size = [
        min(
            _normalize(
                float(len(state.get("deck", []))), float(max(1, spec.initialDeckSize))
            ),
            1.0,
        )
    ]

    opponent_sizes = [
        min(_normalize(float(len(player.get("hand", []))), max_hand), 1.0)
        for player in state.get("players", [])[1:]
    ]

    vector: list[float] = (
        rank_counts
        + suit_counts
        + joker_feat
        + top_rank
        + top_suit
        + top_joker
        + damage
        + direction
        + current_player
        + deck_size
        + opponent_sizes
    )

    if len(vector) != spec.vectorSize:
        raise ValueError(
            f"Observation length {len(vector)} does not match spec {spec.vectorSize}"
        )

    return vector


OBSERVATION_RANKS = RANKS
OBSERVATION_SUITS = SUITS
