import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import { EngineStepResult } from '@/modules/game/domain/engine/gameEngine';
import {
  GameSessionRecord,
  GameStateStore,
} from '@/modules/game/state/game-state.store';
import { GameEngineService } from '@/modules/game/services/game-engine.service';
import {
  GameActionDto,
  GameActionType,
} from '@/modules/game/dto/game-action.dto';
import { GameAiService } from '@/modules/game/services/game-ai.service';

export interface GameResource {
  id: string;
  state: GameState;
  createdAt: string;
  updatedAt: string;
}

export interface GameSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  gameStatus: GameState['gameStatus'];
  currentPlayerIndex: number;
}

type StepResult = EngineStepResult;

@Injectable()
export class GameService {
  public constructor(
    private readonly gameStateStore: GameStateStore,
    private readonly gameEngine: GameEngineService,
    private readonly gameAiService: GameAiService,
  ) {}

  public listGames(): GameSummary[] {
    return this.gameStateStore.list().map((record) => ({
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      gameStatus: record.state.gameStatus,
      currentPlayerIndex: record.state.currentPlayerIndex,
    }));
  }

  public createGame(settings?: Partial<GameSettings>): GameResource {
    const record = this.gameStateStore.create(settings);
    return this.toResource(record);
  }

  public getGame(gameId: string): GameResource {
    const record = this.findGameOrThrow(gameId);
    return this.toResource(record);
  }

  public applyAction(
    gameId: string,
    actionPayload?: GameActionDto,
  ): StepResult {
    if (!actionPayload) {
      throw new BadRequestException('Action payload is required');
    }

    const record = this.findGameOrThrow(gameId);
    if (
      record.state.gameStatus === 'waiting' &&
      actionPayload.type !== GameActionType.START_GAME
    ) {
      throw new BadRequestException('게임이 아직 시작되지 않았습니다.');
    }

    const action = this.gameEngine.buildAction(actionPayload);
    const result = this.gameEngine.step(record.state, action);
    this.gameStateStore.updateState(gameId, result.state);
    return result;
  }

  public executeAiTurn(gameId: string): StepResult {
    const record = this.findGameOrThrow(gameId);
    const currentState: GameState = record.state;
    if (currentState.gameStatus !== 'playing') {
      throw new BadRequestException('게임이 아직 시작되지 않았습니다.');
    }
    if (!this.gameAiService.isAiTurn(currentState)) {
      throw new BadRequestException('현재 차례는 AI가 아닙니다.');
    }

    const aiResult: StepResult | null =
      this.gameAiService.playWhileAiTurn(currentState);
    if (!aiResult) {
      throw new BadRequestException('AI가 수행할 수 있는 행동이 없습니다.');
    }

    this.gameStateStore.updateState(gameId, aiResult.state);
    return aiResult;
  }

  public deleteGame(gameId: string): void {
    const deleted = this.gameStateStore.delete(gameId);
    if (!deleted) {
      throw new NotFoundException(`Game ${gameId} not found`);
    }
  }

  private findGameOrThrow(gameId: string): GameSessionRecord {
    const record = this.gameStateStore.find(gameId);
    if (!record) {
      throw new NotFoundException(`Game ${gameId} not found`);
    }
    return record;
  }

  private toResource(record: GameSessionRecord): GameResource {
    return {
      id: record.id,
      state: record.state,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    };
  }
}
