import math

import pytest

from onecard_api.inference.action_mask import (
    build_action_mask,
    map_action_index_to_payload,
)
from onecard_api.inference.observation_encoder import (
    build_observation_spec,
    encode_observation,
)


def _make_state(**overrides):
    base = {
        "players": [
            {"id": "p0", "name": "me", "hand": [], "isSelf": True, "isAI": False}
        ],
        "currentPlayerIndex": 0,
        "deck": [],
        "discardPile": [],
        "direction": "clockwise",
        "damage": 0,
        "gameStatus": "playing",
        "settings": {
            "mode": "single",
            "numberOfPlayers": 2,
            "includeJokers": False,
            "initHandSize": 5,
            "maxHandSize": 5,
            "difficulty": "easy",
        },
    }
    base.update(overrides)
    return base


def test_action_mask_no_discard():
    state = _make_state(
        players=[
            {
                "id": "p0",
                "name": "me",
                "hand": [
                    {"id": "c1", "isJoker": False, "rank": 3, "suit": "hearts"},
                    {"id": "c2", "isJoker": True},
                ],
                "isSelf": True,
                "isAI": False,
            }
        ]
    )
    mask = build_action_mask(state, max_hand_size=5)
    assert mask[:2] == [True, True]  # two cards playable when no discard pile
    assert mask[2:5] == [False, False, False]
    assert mask[5] is True  # draw allowed because hand < max


def test_action_mask_damage_blocking():
    state = _make_state(
        damage=2,
        discardPile=[{"id": "d1", "isJoker": False, "rank": 2, "suit": "hearts"}],
        players=[
            {
                "id": "p0",
                "name": "me",
                "hand": [
                    {"id": "c1", "isJoker": False, "rank": 1, "suit": "hearts"},  # can block 2
                    {"id": "c2", "isJoker": False, "rank": 3, "suit": "clubs"},  # cannot block
                ],
                "isSelf": True,
                "isAI": False,
            }
        ],
    )
    mask = build_action_mask(state, max_hand_size=5)
    assert mask[0] is True
    assert mask[1] is False
    assert mask[5] is True  # draw still allowed if hand < max


def test_map_action_index_to_payload_play_and_draw():
    state = _make_state(
        discardPile=[{"id": "d1", "isJoker": False, "rank": 5, "suit": "spades"}],
        players=[
            {
                "id": "p0",
                "name": "me",
                "hand": [
                    {"id": "c1", "isJoker": False, "rank": 5, "suit": "hearts"},
                ],
                "isSelf": True,
                "isAI": False,
            }
        ],
    )
    play_payload = map_action_index_to_payload(0, state, max_hand_size=5)
    assert play_payload == {"type": "PLAY_CARD", "playerIndex": 0, "cardIndex": 0}

    draw_payload = map_action_index_to_payload(5, state, max_hand_size=5)
    assert draw_payload["type"] == "DRAW_CARD"
    assert draw_payload["amount"] >= 1


def test_encode_observation_top_joker_sets_flag():
    state = _make_state(
        discardPile=[{"id": "d1", "isJoker": True}],
        players=[
            {
                "id": "p0",
                "name": "me",
                "hand": [{"id": "c1", "isJoker": False, "rank": 2, "suit": "hearts"}],
                "isSelf": True,
                "isAI": False,
            },
            {"id": "p1", "name": "cpu", "hand": [], "isSelf": False, "isAI": True},
        ],
    )
    spec = build_observation_spec(state["settings"])
    vector = encode_observation(state, spec)
    assert len(vector) == spec.vectorSize
    # Layout: rank_counts + suit_counts + joker + top_rank + top_suit + top_joker ...
    top_joker_index = len(spec.ranks) + len(spec.suits) + 1 + len(spec.ranks) + len(spec.suits)
    assert math.isclose(vector[top_joker_index], 1.0, rel_tol=1e-6)
