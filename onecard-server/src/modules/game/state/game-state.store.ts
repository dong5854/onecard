import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import { GAME_DEFAULT_SETTINGS } from '@/modules/game/constants/game.constants';
import { GameEngineService } from '@/modules/game/services/game-engine.service';

export interface GameSessionRecord {
  id: string;
  settings: GameSettings;
  state: GameState;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class GameStateStore {
  private readonly sessions = new Map<string, GameSessionRecord>();

  public constructor(
    @Inject(GAME_DEFAULT_SETTINGS)
    private readonly defaultSettings: GameSettings,
    private readonly gameEngine: GameEngineService,
  ) {}

  public create(settings?: Partial<GameSettings>): GameSessionRecord {
    const mergedSettings = this.mergeWithDefaults(settings);
    const id = randomUUID();
    const state = this.gameEngine.createStartedState(mergedSettings);
    const timestamp = new Date();
    const record: GameSessionRecord = {
      id,
      settings: mergedSettings,
      state,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.sessions.set(id, record);
    return record;
  }

  public list(): GameSessionRecord[] {
    return Array.from(this.sessions.values());
  }

  public find(gameId: string): GameSessionRecord | undefined {
    return this.sessions.get(gameId);
  }

  public updateState(
    gameId: string,
    state: GameState,
  ): GameSessionRecord | null {
    const record = this.sessions.get(gameId);
    if (!record) {
      return null;
    }
    const updatedRecord: GameSessionRecord = {
      ...record,
      state,
      updatedAt: new Date(),
    };
    this.sessions.set(gameId, updatedRecord);
    return updatedRecord;
  }

  public delete(gameId: string): boolean {
    return this.sessions.delete(gameId);
  }

  private mergeWithDefaults(settings?: Partial<GameSettings>): GameSettings {
    return {
      ...this.defaultSettings,
      ...this.removeUndefined(settings),
    };
  }

  private removeUndefined(
    settings?: Partial<GameSettings>,
  ): Partial<GameSettings> {
    if (!settings) {
      return {};
    }

    return (Object.keys(settings) as (keyof GameSettings)[]).reduce<
      Partial<GameSettings>
    >((acc, key) => {
      const value = settings[key];
      if (value === undefined) {
        return acc;
      }
      return {
        ...acc,
        [key]: value,
      };
    }, {});
  }
}
