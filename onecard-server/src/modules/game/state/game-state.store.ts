import { Inject, Injectable } from '@nestjs/common';
import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import { GAME_DEFAULT_SETTINGS } from '@/modules/game/constants/game.constants';
import { GameEngineService } from '@/modules/game/services/game-engine.service';

@Injectable()
export class GameStateStore {
  private state: GameState;

  constructor(
    @Inject(GAME_DEFAULT_SETTINGS)
    private readonly defaultSettings: GameSettings,
    private readonly gameEngine: GameEngineService,
  ) {
    this.state = this.gameEngine.createStartedState({
      ...this.defaultSettings,
    });
  }

  get snapshot(): GameState {
    return this.state;
  }

  reset(settings?: Partial<GameSettings>): GameState {
    const mergedSettings: GameSettings = {
      ...this.defaultSettings,
      ...this.removeUndefined(settings),
    };
    this.state = this.gameEngine.createStartedState(mergedSettings);
    return this.state;
  }

  update(state: GameState): void {
    this.state = state;
  }

  private removeUndefined(
    settings?: Partial<GameSettings>,
  ): Partial<GameSettings> {
    if (!settings) {
      return {};
    }

    return Object.entries(settings).reduce<Partial<GameSettings>>(
      (acc, [key, value]) => {
        if (value !== undefined) {
          (acc as Record<string, GameSettings[keyof GameSettings]>)[key] =
            value;
        }
        return acc;
      },
      {},
    );
  }
}
