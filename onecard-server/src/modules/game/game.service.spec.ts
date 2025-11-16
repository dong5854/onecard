import { BadRequestException, NotFoundException } from '@nestjs/common';
import { GameService } from '@/modules/game/game.service';
import type { GameStateStore } from '@/modules/game/state/game-state.store';
import type { GameEngineService } from '@/modules/game/services/game-engine.service';
import type { GameAiService } from '@/modules/game/services/game-ai.service';
import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import type { GameActionDto } from '@/modules/game/dto/game-action.dto';
import { GameActionType } from '@/modules/game/dto/game-action.dto';
import type { GameAction } from '@/modules/game/domain/types/gameAction';
import type { GameSessionRecord } from '@/modules/game/state/game-state.store';
import type { EngineStepResult } from '@/modules/game/domain/engine/gameEngine';

const baseSettings: GameSettings = {
  mode: 'single',
  numberOfPlayers: 2,
  includeJokers: false,
  initHandSize: 5,
  maxHandSize: 15,
  difficulty: 'easy',
};

const createState = (overrides: Partial<GameState> = {}): GameState => ({
  players: [],
  currentPlayerIndex: 0,
  deck: [],
  discardPile: [],
  direction: 'clockwise',
  damage: 0,
  gameStatus: 'playing',
  settings: baseSettings,
  ...overrides,
});

const createRecord = (
  overrides: Partial<GameSessionRecord> = {},
): GameSessionRecord => {
  const now = new Date('2024-01-01T00:00:00.000Z');
  return {
    id: 'session-id',
    settings: baseSettings,
    state: createState(),
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
};

describe('GameService', () => {
  interface StoreContract {
    create: (
      ...args: Parameters<GameStateStore['create']>
    ) => ReturnType<GameStateStore['create']>;
    list: (
      ...args: Parameters<GameStateStore['list']>
    ) => ReturnType<GameStateStore['list']>;
    find: (
      ...args: Parameters<GameStateStore['find']>
    ) => ReturnType<GameStateStore['find']>;
    updateState: (
      ...args: Parameters<GameStateStore['updateState']>
    ) => ReturnType<GameStateStore['updateState']>;
    delete: (
      ...args: Parameters<GameStateStore['delete']>
    ) => ReturnType<GameStateStore['delete']>;
  }

  interface EngineContract {
    buildAction: (
      ...args: Parameters<GameEngineService['buildAction']>
    ) => ReturnType<GameEngineService['buildAction']>;
    step: (
      ...args: Parameters<GameEngineService['step']>
    ) => ReturnType<GameEngineService['step']>;
    createStartedState: (
      ...args: Parameters<GameEngineService['createStartedState']>
    ) => ReturnType<GameEngineService['createStartedState']>;
  }

  interface AiContract {
    isAiTurn: (
      ...args: Parameters<GameAiService['isAiTurn']>
    ) => ReturnType<GameAiService['isAiTurn']>;
    playWhileAiTurn: (
      ...args: Parameters<GameAiService['playWhileAiTurn']>
    ) => ReturnType<GameAiService['playWhileAiTurn']>;
  }

  type MockedMethods<T> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Result
      ? jest.Mock<Result, Args>
      : never;
  };

  const createMock = <Fn extends (...args: never[]) => unknown>(): jest.Mock<
    ReturnType<Fn>,
    Parameters<Fn>
  > => jest.fn<ReturnType<Fn>, Parameters<Fn>>();

  let service: GameService;
  let store: MockedMethods<StoreContract>;
  let engine: MockedMethods<EngineContract>;
  let aiService: MockedMethods<AiContract>;

  beforeEach(() => {
    store = {
      create: createMock<StoreContract['create']>(),
      list: createMock<StoreContract['list']>(),
      find: createMock<StoreContract['find']>(),
      updateState: createMock<StoreContract['updateState']>(),
      delete: createMock<StoreContract['delete']>(),
    };
    engine = {
      buildAction: createMock<EngineContract['buildAction']>(),
      step: createMock<EngineContract['step']>(),
      createStartedState: createMock<EngineContract['createStartedState']>(),
    };
    aiService = {
      isAiTurn: createMock<AiContract['isAiTurn']>(),
      playWhileAiTurn: createMock<AiContract['playWhileAiTurn']>(),
    };
    service = new GameService(
      store as unknown as GameStateStore,
      engine as unknown as GameEngineService,
      aiService as unknown as GameAiService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('lists games as summaries', () => {
    const record = createRecord({
      state: createState({ currentPlayerIndex: 1, gameStatus: 'playing' }),
    });
    store.list.mockReturnValue([record]);

    const summaries = service.listGames();

    expect(summaries).toEqual([
      {
        id: record.id,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString(),
        gameStatus: 'playing',
        currentPlayerIndex: 1,
      },
    ]);
  });

  it('creates a game and returns the resource', () => {
    const record = createRecord();
    store.create.mockReturnValue(record);

    const resource = service.createGame({ initHandSize: 7 });

    expect(store.create).toHaveBeenCalledWith({ initHandSize: 7 });
    expect(resource).toEqual({
      id: record.id,
      state: record.state,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    });
  });

  it('retrieves a game resource by id', () => {
    const record = createRecord();
    store.find.mockReturnValue(record);

    expect(service.getGame('session-id').id).toBe('session-id');
    expect(store.find).toHaveBeenCalledWith('session-id');
  });

  it('throws when a game is not found', () => {
    store.find.mockReturnValue(undefined);
    expect(() => service.getGame('missing')).toThrow(NotFoundException);
  });

  it('requires an action payload when applying actions', () => {
    expect(() => service.applyAction('session-id')).toThrow(
      BadRequestException,
    );
  });

  it('applies an action and persists the resulting state', () => {
    const record = createRecord();
    const builtAction = { type: 'NEXT_TURN' } as GameAction;
    const stepResult = {
      state: createState({ currentPlayerIndex: 1 }),
    } as EngineStepResult;

    store.find.mockReturnValue(record);
    engine.buildAction.mockReturnValue(builtAction);
    engine.step.mockReturnValue(stepResult);

    const dto = { type: GameActionType.NEXT_TURN } as GameActionDto;
    const result = service.applyAction(record.id, dto);

    expect(engine.buildAction).toHaveBeenCalledWith(dto);
    expect(engine.step).toHaveBeenCalledWith(record.state, builtAction);
    expect(store.updateState).toHaveBeenCalledWith(record.id, stepResult.state);
    expect(result).toBe(stepResult);
  });

  it('rejects AI execution when it is not the AI turn', () => {
    const record = createRecord();
    store.find.mockReturnValue(record);
    aiService.isAiTurn.mockReturnValue(false);

    expect(() => service.executeAiTurn(record.id)).toThrow(BadRequestException);
  });

  it('rejects AI execution when there is no action to perform', () => {
    const record = createRecord();
    store.find.mockReturnValue(record);
    aiService.isAiTurn.mockReturnValue(true);
    aiService.playWhileAiTurn.mockReturnValue(null);

    expect(() => service.executeAiTurn(record.id)).toThrow(BadRequestException);
  });

  it('updates the state when the AI turn succeeds', () => {
    const record = createRecord();
    const aiResult = {
      state: createState({ currentPlayerIndex: 1 }),
    } as EngineStepResult;
    store.find.mockReturnValue(record);
    aiService.isAiTurn.mockReturnValue(true);
    aiService.playWhileAiTurn.mockReturnValue(aiResult);

    const result = service.executeAiTurn(record.id);

    expect(aiService.playWhileAiTurn).toHaveBeenCalledWith(record.state);
    expect(store.updateState).toHaveBeenCalledWith(record.id, aiResult.state);
    expect(result).toBe(aiResult);
  });

  it('deletes a game session', () => {
    store.delete.mockReturnValue(true);
    expect(() => {
      service.deleteGame('session-id');
    }).not.toThrow();
    expect(store.delete).toHaveBeenCalledWith('session-id');
  });

  it('throws when deleting a missing session', () => {
    store.delete.mockReturnValue(false);
    expect(() => {
      service.deleteGame('missing');
    }).toThrow(NotFoundException);
  });
});
