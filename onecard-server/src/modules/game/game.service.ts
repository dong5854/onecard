import { BadRequestException, Injectable } from '@nestjs/common';
import { GameSettings, GameState } from '@/modules/game/domain/types/gameState';
import { EngineStepResult } from '@/modules/game/domain/engine/gameEngine';
import { GameStateStore } from '@/modules/game/state/game-state.store';
import { GameEngineService } from '@/modules/game/services/game-engine.service';
import { GameActionDto } from '@/modules/game/dto/game-action.dto';
import { GameAiService } from '@/modules/game/services/game-ai.service';

export type StateResponse = { state: GameState };
type StepResult = EngineStepResult;

@Injectable()
export class GameService {
  constructor(
    private readonly gameStateStore: GameStateStore,
    private readonly gameEngine: GameEngineService,
    private readonly gameAiService: GameAiService,
  ) {}

  getState(): StateResponse {
    return { state: this.gameStateStore.snapshot };
  }

  resetState(settings?: Partial<GameSettings>): StateResponse {
    const state = this.gameStateStore.reset(settings);
    return { state };
  }

  step(actionPayload?: GameActionDto): StepResult {
    if (!actionPayload) {
      throw new BadRequestException('Action payload is required');
    }

    const action = this.gameEngine.buildAction(actionPayload);
    const currentState: GameState = this.gameStateStore.snapshot;
    const result = this.gameEngine.step(currentState, action);
    this.gameStateStore.update(result.state);
    return result;
  }

  executeAiTurn(): StepResult {
    const currentState: GameState = this.gameStateStore.snapshot;
    if (!this.gameAiService.isAiTurn(currentState)) {
      throw new BadRequestException('현재 차례는 AI가 아닙니다.');
    }

    const aiResult: StepResult | null =
      this.gameAiService.playWhileAiTurn(currentState);
    if (!aiResult) {
      throw new BadRequestException('AI가 수행할 수 있는 행동이 없습니다.');
    }

    this.gameStateStore.update(aiResult.state);
    return aiResult;
  }
}
