from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class EffectCardDto(BaseModel):
    id: str
    isJoker: bool
    isFlipped: bool
    rank: int | str | None = None
    suit: str | None = None

    model_config = ConfigDict(extra="forbid")


class GameActionDto(BaseModel):
    type: Literal[
        "START_GAME",
        "PLAY_CARD",
        "DRAW_CARD",
        "NEXT_TURN",
        "APPLY_SPECIAL_EFFECT",
        "END_GAME",
    ]
    playerIndex: int | None = Field(default=None, ge=0)
    cardIndex: int | None = Field(default=None, ge=0)
    amount: int | None = Field(default=None, ge=1)
    effectCard: EffectCardDto | None = None
    winnerIndex: int | None = Field(default=None, ge=0)

    model_config = ConfigDict(extra="forbid")


class ApplyGameActionDto(BaseModel):
    action: GameActionDto

    model_config = ConfigDict(extra="forbid")


class GameSettingsDto(BaseModel):
    mode: Literal["single", "multi"] | None = None
    numberOfPlayers: int | None = Field(default=None, ge=2, le=6)
    includeJokers: bool | None = None
    initHandSize: int | None = Field(default=None, ge=1, le=15)
    maxHandSize: int | None = Field(default=None, ge=1, le=20)
    difficulty: Literal["easy", "medium", "hard"] | None = None

    model_config = ConfigDict(extra="forbid")


class CreateGameDto(BaseModel):
    settings: GameSettingsDto | None = None

    model_config = ConfigDict(extra="forbid")


class OnnxHealthQueryDto(BaseModel):
    players: int = Field(ge=2, le=4)
    includeJokers: bool
    initHandSize: int = Field(ge=1, le=30)
    maxHandSize: int = Field(ge=1, le=50)
    difficulty: Literal["easy", "medium", "hard"] | None = None

    model_config = ConfigDict(extra="forbid")
