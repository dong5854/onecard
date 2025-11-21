/* eslint-disable @typescript-eslint/unbound-method */
import { OnnxPolicyController } from '@/modules/game/inference/onnx-policy.controller';
import { GameActionType } from '@/modules/game/dto/game-action.dto';
import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import type { GameService } from '@/modules/game/game.service';
import type { OnnxPolicyService } from '@/modules/game/inference/onnx-policy.service';

describe('OnnxPolicyController', () => {
  const createState = (overrides: Partial<GameState> = {}): GameState => ({
    players: [],
    currentPlayerIndex: 0,
    deck: [],
    discardPile: [],
    direction: 'clockwise',
    damage: 0,
    gameStatus: 'playing',
    settings: {
      mode: 'single',
      numberOfPlayers: 2,
      includeJokers: false,
      initHandSize: 5,
      maxHandSize: 15,
      difficulty: 'medium',
    },
    ...overrides,
  });

  const mockGame = (
    stateOverrides: Partial<GameState> = {},
  ): { id: string; state: GameState } => ({
    id: 'game-1',
    state: createState(stateOverrides),
  });

  const gameService = {
    getGame: jest.fn(),
  } as unknown as jest.Mocked<GameService>;

  const onnxService = {
    predictAction: jest.fn(),
    checkHealth: jest.fn(),
  } as unknown as jest.Mocked<OnnxPolicyService>;

  const controller = new OnnxPolicyController(gameService, onnxService);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns predicted action from onnx service', async () => {
    const state = createState();
    gameService.getGame.mockReturnValue(mockGame());
    onnxService.predictAction.mockResolvedValue({
      actionIndex: 1,
      payload: { type: GameActionType.PLAY_CARD, playerIndex: 0, cardIndex: 1 },
      logits: [0, 1],
    });

    const result = await controller.predict('game-1', 'true');

    const predictMock: jest.MockedFunction<OnnxPolicyService['predictAction']> =
      onnxService.predictAction as unknown as jest.MockedFunction<
        OnnxPolicyService['predictAction']
      >;
    expect(predictMock.mock.calls[0][0]).toEqual(state);
    expect(result.actionIndex).toBe(1);
    expect(result.payload).toEqual({
      type: GameActionType.PLAY_CARD,
      playerIndex: 0,
      cardIndex: 1,
    });
    expect(result.logits).toEqual([0, 1]);
  });

  it('checks health for provided settings', async () => {
    const settings: GameSettings = {
      mode: 'single',
      numberOfPlayers: 3,
      includeJokers: true,
      initHandSize: 5,
      maxHandSize: 15,
      difficulty: 'medium',
    };
    onnxService.checkHealth.mockResolvedValue({
      suffix: 'p3_jokeron',
      observationDim: 44,
      actionDim: 16,
      settings,
    });

    const result = await controller.health({
      players: 3,
      includeJokers: true,
      initHandSize: 5,
      maxHandSize: 15,
      difficulty: 'medium',
    });

    const healthMock: jest.MockedFunction<OnnxPolicyService['checkHealth']> =
      onnxService.checkHealth as unknown as jest.MockedFunction<
        OnnxPolicyService['checkHealth']
      >;
    expect(healthMock.mock.calls.length).toBeGreaterThan(0);
    expect(result.suffix).toBe('p3_jokeron');
    expect(result.observationDim).toBe(44);
    expect(result.actionDim).toBe(16);
  });
});
