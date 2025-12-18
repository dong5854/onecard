from __future__ import annotations

from .card_utils import create_deck, deal_cards, shuffle_deck
from .players import create_ai_player, create_myself
from .types import AIDifficulty, GameSettings, GameState, Player


def create_game_state(settings: GameSettings) -> GameState:
    return {
        "players": [],
        "currentPlayerIndex": 0,
        "deck": [],
        "discardPile": [],
        "direction": "clockwise",
        "damage": 0,
        "gameStatus": "waiting",
        "settings": settings,
        "winner": None,
    }


def initialize_game_state(settings: GameSettings) -> GameState:
    if settings["mode"] == "single":
        return _initialize_single_play_game(settings)
    # 멀티플레이는 아직 미지원: 단일 플레이로 초기화
    return _initialize_single_play_game(settings)


def start_game(state: GameState) -> GameState:
    deck = list(state["deck"])
    if not deck:
        raise ValueError("Cannot start a game without cards in the deck.")
    top_card = deck.pop()
    return {
        **state,
        "deck": deck,
        "discardPile": [top_card],
        "gameStatus": "playing",
    }


def update_players(state: GameState, players: list[Player]) -> GameState:
    return {**state, "players": players}


def update_deck(state: GameState, deck: list) -> GameState:
    return {**state, "deck": deck}


def _initialize_single_play_game(settings: GameSettings) -> GameState:
    deck = shuffle_deck(create_deck(settings["includeJokers"]))
    players = _initialize_player_roles(settings["numberOfPlayers"], settings["difficulty"])
    updated_players, updated_deck = deal_cards(players, deck, settings["initHandSize"])
    return {
        "players": updated_players,
        "currentPlayerIndex": 0,
        "deck": updated_deck,
        "discardPile": [],
        "direction": "clockwise",
        "damage": 0,
        "gameStatus": "waiting",
        "settings": settings,
        "winner": None,
    }


def _initialize_player_roles(
    number_of_players: int, ai_difficulty: AIDifficulty
) -> list[Player]:
    players: list[Player] = []
    for i in range(number_of_players):
        player_index = str(i)
        if i == 0:
            players.append(create_myself(f"player-{player_index}", "me", []))
        else:
            players.append(
                create_ai_player(
                    f"player-{player_index}",
                    f"cpu-{player_index}",
                    [],
                    ai_difficulty,
                )
            )
    return players
