import { BadRequestException } from '@nestjs/common';
import { GameEngineService } from '@/modules/game/services/game-engine.service';
import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import type { GameActionDto } from '@/modules/game/dto/game-action.dto';
import { GameActionType } from '@/modules/game/dto/game-action.dto';
import type { GameAction } from '@/modules/game/domain/types/gameAction';
import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';
import type { EngineStepResult } from '@/modules/game/domain/engine/gameEngine';
import type * as GameEngineModule from '@/modules/game/domain/engine/gameEngine';
import {
  applySpecialEffectAction,
  createStartedState as createStartedEngineState,
  drawCardAction,
  endGameAction,
  nextTurnAction,
  playCardAction,
  startGameAction,
  step as engineStep,
} from '@/modules/game/domain/engine/gameEngine';

jest.mock('@/modules/game/domain/engine/gameEngine', () => {
  const actual = jest.requireActual<typeof GameEngineModule>(
    '@/modules/game/domain/engine/gameEngine',
  );
  return {
    ...actual,
    createStartedState: jest.fn(),
    step: jest.fn(),
    startGameAction: jest.fn(),
    playCardAction: jest.fn(),
    drawCardAction: jest.fn(),
    nextTurnAction: jest.fn(),
    applySpecialEffectAction: jest.fn(),
    endGameAction: jest.fn(),
  };
});

const mockedCreateStartedState =
  createStartedEngineState as jest.MockedFunction<
    typeof createStartedEngineState
  >;
const mockedStep = engineStep as jest.MockedFunction<typeof engineStep>;
const mockedStartGameAction = startGameAction as jest.MockedFunction<
  typeof startGameAction
>;
const mockedPlayCardAction = playCardAction as jest.MockedFunction<
  typeof playCardAction
>;
const mockedDrawCardAction = drawCardAction as jest.MockedFunction<
  typeof drawCardAction
>;
const mockedNextTurnAction = nextTurnAction as jest.MockedFunction<
  typeof nextTurnAction
>;
const mockedApplySpecialEffectAction =
  applySpecialEffectAction as jest.MockedFunction<
    typeof applySpecialEffectAction
  >;
const mockedEndGameAction = endGameAction as jest.MockedFunction<
  typeof endGameAction
>;

describe('GameEngineService', () => {
  const service = new GameEngineService();
  const settings: GameSettings = {
    mode: 'single',
    numberOfPlayers: 2,
    includeJokers: false,
    initHandSize: 5,
    maxHandSize: 15,
    difficulty: 'easy',
  };
  const gameState = {
    players: [],
    deck: [],
    discardPile: [],
    direction: 'clockwise',
    damage: 0,
    currentPlayerIndex: 0,
    gameStatus: 'waiting',
    settings,
  } satisfies GameState;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('delegates createStartedState to the engine helpers', () => {
    const mockedResult = { ...gameState, gameStatus: 'playing' };
    mockedCreateStartedState.mockReturnValueOnce(mockedResult);

    expect(service.createStartedState(settings)).toBe(mockedResult);
    expect(mockedCreateStartedState).toHaveBeenCalledWith(settings);
  });

  it('delegates step execution to the domain engine', () => {
    const expectedResult = {
      state: gameState,
      done: false,
      info: {},
    } satisfies EngineStepResult;
    const action = { type: 'START_GAME' } as GameAction;
    mockedStep.mockReturnValueOnce(expectedResult);

    expect(service.step(gameState, action)).toBe(expectedResult);
    expect(mockedStep).toHaveBeenCalledWith(gameState, action);
  });

  it('builds a start game action', () => {
    const startAction = { type: 'START_GAME' } as GameAction;
    mockedStartGameAction.mockReturnValueOnce(startAction);

    const result = service.buildAction({ type: GameActionType.START_GAME });
    expect(result).toBe(startAction);
    expect(mockedStartGameAction).toHaveBeenCalledTimes(1);
  });

  it('builds a play card action with the provided indices', () => {
    const playAction = {
      type: 'PLAY_CARD',
      payload: { playerIndex: 0, cardIndex: 1 },
    } as GameAction;
    mockedPlayCardAction.mockReturnValueOnce(playAction);

    const dto: GameActionDto = {
      type: GameActionType.PLAY_CARD,
      playerIndex: 0,
      cardIndex: 1,
    };

    expect(service.buildAction(dto)).toBe(playAction);
    expect(mockedPlayCardAction).toHaveBeenCalledWith(0, 1);
  });

  it('throws when play card action is missing indices', () => {
    const dto: GameActionDto = {
      type: GameActionType.PLAY_CARD,
      playerIndex: undefined,
      cardIndex: undefined,
    };
    expect(() => service.buildAction(dto)).toThrow(BadRequestException);
    expect(mockedPlayCardAction).not.toHaveBeenCalled();
  });

  it('builds a draw card action with default amount', () => {
    const drawAction = {
      type: 'DRAW_CARD',
      payload: { amount: 1 },
    } as GameAction;
    mockedDrawCardAction.mockReturnValueOnce(drawAction);

    const dto: GameActionDto = {
      type: GameActionType.DRAW_CARD,
    };

    expect(service.buildAction(dto)).toBe(drawAction);
    expect(mockedDrawCardAction).toHaveBeenCalledWith(1);
  });

  it('builds a next turn action', () => {
    const nextAction = { type: 'NEXT_TURN' } as GameAction;
    mockedNextTurnAction.mockReturnValueOnce(nextAction);

    expect(service.buildAction({ type: GameActionType.NEXT_TURN })).toBe(
      nextAction,
    );
    expect(mockedNextTurnAction).toHaveBeenCalledTimes(1);
  });

  it('requires an effect card when applying special effects', () => {
    expect(() =>
      service.buildAction({
        type: GameActionType.APPLY_SPECIAL_EFFECT,
      }),
    ).toThrow(BadRequestException);
  });

  it('builds a special effect action with sanitized card data', () => {
    const effectAction = {
      type: 'APPLY_SPECIAL_EFFECT',
      payload: {
        effectCard: {
          id: 'card-id',
          isJoker: true,
          isFlipped: false,
        } as PokerCardPropsWithId,
      },
    } as GameAction;
    mockedApplySpecialEffectAction.mockReturnValueOnce(effectAction);

    const dto: GameActionDto = {
      type: GameActionType.APPLY_SPECIAL_EFFECT,
      effectCard: {
        id: 'card-id',
        isJoker: true,
        isFlipped: false,
        rank: 'not-a-rank',
        suit: 'not-a-suit',
      },
    };

    expect(service.buildAction(dto)).toBe(effectAction);
    expect(mockedApplySpecialEffectAction).toHaveBeenCalledWith({
      id: 'card-id',
      isJoker: true,
      isFlipped: false,
    });
  });

  it('builds an end game action using default winner index', () => {
    const endAction = {
      type: 'END_GAME',
      payload: { winnerIndex: 0 },
    } as GameAction;
    mockedEndGameAction.mockReturnValueOnce(endAction);

    const dto: GameActionDto = {
      type: GameActionType.END_GAME,
    };

    expect(service.buildAction(dto)).toBe(endAction);
    expect(mockedEndGameAction).toHaveBeenCalledWith(0);
  });
});
