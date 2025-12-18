from __future__ import annotations

from typing import Literal, NotRequired, TypedDict

RankValue = int
SuitValue = Literal["clubs", "diamonds", "hearts", "spades"]
Direction = Literal["clockwise", "counterclockwise"]
Mode = Literal["single", "multi"]
GameStatus = Literal["waiting", "playing", "finished"]
AIDifficulty = Literal["easy", "medium", "hard"]

ranks: dict[int, str] = {
    1: "A",
    2: "2",
    3: "3",
    4: "4",
    5: "5",
    6: "6",
    7: "7",
    8: "8",
    9: "9",
    10: "10",
    11: "J",
    12: "Q",
    13: "K",
}

suits: dict[SuitValue, str] = {
    "clubs": "♣",
    "diamonds": "♦",
    "hearts": "♥",
    "spades": "♠",
}


def is_valid_rank(rank: object) -> bool:
    return isinstance(rank, int) and rank in ranks


def is_valid_suit(suit: object) -> bool:
    return isinstance(suit, str) and suit in suits


class PokerCard(TypedDict, total=False):
    id: str
    isJoker: bool
    isFlipped: bool
    rank: RankValue
    suit: SuitValue
    draggable: bool


class Player(TypedDict, total=False):
    id: str
    name: str
    hand: list[PokerCard]
    isSelf: bool
    isAI: bool
    difficulty: AIDifficulty


class GameSettings(TypedDict):
    mode: Mode
    numberOfPlayers: int
    includeJokers: bool
    initHandSize: int
    maxHandSize: int
    difficulty: AIDifficulty


class GameState(TypedDict, total=False):
    players: list[Player]
    currentPlayerIndex: int
    deck: list[PokerCard]
    discardPile: list[PokerCard]
    direction: Direction
    damage: int
    gameStatus: GameStatus
    settings: GameSettings
    winner: NotRequired[Player | None]
