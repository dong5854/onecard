import { Module } from '@nestjs/common';
import { GameController } from '@/modules/game/game.controller';
import { GameService } from '@/modules/game/game.service';
import { GameEngineService } from '@/modules/game/services/game-engine.service';
import { GameStateStore } from '@/modules/game/state/game-state.store';
import {
  DEFAULT_GAME_SETTINGS,
  GAME_DEFAULT_SETTINGS,
} from '@/modules/game/constants/game.constants';
import { GameAiService } from '@/modules/game/services/game-ai.service';

@Module({
  controllers: [GameController],
  providers: [
    GameService,
    GameEngineService,
    GameAiService,
    GameStateStore,
    {
      provide: GAME_DEFAULT_SETTINGS,
      useValue: DEFAULT_GAME_SETTINGS,
    },
  ],
})
export class GameModule {}
