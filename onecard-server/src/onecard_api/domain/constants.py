from __future__ import annotations

from .types import GameSettings

DEFAULT_GAME_SETTINGS: GameSettings = {
    "mode": "single",
    "numberOfPlayers": 2,
    "includeJokers": False,
    "initHandSize": 5,
    "maxHandSize": 15,
    "difficulty": "easy",
}
