from __future__ import annotations

from copy import deepcopy
from datetime import datetime, timezone
from typing import TypedDict
from uuid import uuid4

from onecard_api.domain.constants import DEFAULT_GAME_SETTINGS
from onecard_api.domain.types import GameSettings, GameState
from onecard_api.services.game_engine_service import GameEngineService


class GameSessionRecord(TypedDict):
    id: str
    settings: GameSettings
    state: GameState
    created_at: datetime
    updated_at: datetime


class GameStateStore:
    def __init__(
        self,
        default_settings: GameSettings = DEFAULT_GAME_SETTINGS,
        game_engine: GameEngineService | None = None,
    ) -> None:
        self._sessions: dict[str, GameSessionRecord] = {}
        self._default_settings = deepcopy(default_settings)
        self._game_engine = game_engine or GameEngineService()

    def create(self, settings: GameSettings | dict | None = None) -> GameSessionRecord:
        merged_settings = self._merge_with_defaults(settings)
        session_id = str(uuid4())
        state = self._game_engine.create_waiting_state(merged_settings)
        now = datetime.now(timezone.utc)
        record: GameSessionRecord = {
            "id": session_id,
            "settings": merged_settings,
            "state": state,
            "created_at": now,
            "updated_at": now,
        }
        self._sessions[session_id] = record
        return record

    def list(self) -> list[GameSessionRecord]:
        return list(self._sessions.values())

    def find(self, game_id: str) -> GameSessionRecord | None:
        return self._sessions.get(game_id)

    def update_state(self, game_id: str, state: GameState) -> GameSessionRecord | None:
        record = self._sessions.get(game_id)
        if not record:
            return None
        updated = {
            **record,
            "state": state,
            "updated_at": datetime.now(timezone.utc),
        }
        self._sessions[game_id] = updated
        return updated

    def delete(self, game_id: str) -> bool:
        return self._sessions.pop(game_id, None) is not None

    def _merge_with_defaults(self, settings: GameSettings | dict | None) -> GameSettings:
        base = deepcopy(self._default_settings)
        if not settings:
            return base
        for key, value in settings.items():
            if value is None:
                continue
            if key in base:
                base[key] = value
        return base
