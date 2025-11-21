/* eslint-disable @typescript-eslint/unbound-method */
import { GameAiService } from '@/modules/game/services/game-ai.service';
import { GameEngineService } from '@/modules/game/services/game-engine.service';
import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import type { Player } from '@/modules/game/domain/types/gamePlayer';
import type {
  PokerCardPropsWithId,
  RankValue,
  SuitsValue,
} from '@/modules/game/domain/types/pokerCard';
import type { GameAction } from '@/modules/game/domain/types/gameAction';
import type { EngineStepResult } from '@/modules/game/domain/engine/gameEngine';
import type { OnnxPolicyService } from '@/modules/game/inference/onnx-policy.service';

const baseSettings: GameSettings = {
  mode: 'single',
  numberOfPlayers: 2,
  includeJokers: false,
  initHandSize: 5,
  maxHandSize: 15,
  difficulty: 'easy',
};

const createCard = (
  id: string,
  rank: RankValue,
  suit: SuitsValue,
  extras: Partial<PokerCardPropsWithId> = {},
): PokerCardPropsWithId => ({
  id,
  rank,
  suit,
  isJoker: false,
  isFlipped: true,
  draggable: false,
  ...extras,
});

const createPlayer = (overrides: Partial<Player> = {}): Player => ({
  id: 'player-id',
  name: 'Player',
  hand: [],
  isSelf: false,
  isAI: true,
  ...overrides,
});

const createState = (overrides: Partial<GameState> = {}): GameState => ({
  players: [
    createPlayer({ id: 'player-0', name: 'Human', isAI: false, isSelf: true }),
    createPlayer({ id: 'player-1', name: 'CPU', isAI: true }),
  ],
  currentPlayerIndex: 0,
  deck: [],
  discardPile: [],
  direction: 'clockwise',
  damage: 0,
  gameStatus: 'playing',
  settings: baseSettings,
  ...overrides,
});

const ensureResult = async (
  result: ReturnType<GameAiService['playWhileAiTurn']>,
): Promise<EngineStepResult> => {
  const awaited = await result;
  if (!awaited) {
    throw new Error('Expected GameAiService to return an EngineStepResult.');
  }
  return awaited;
};

const extractAiActions = (result: EngineStepResult): GameAction[] => {
  const info = result.info;
  if (!info) {
    return [];
  }
  const aiActions = info.aiActions;
  return Array.isArray(aiActions) ? (aiActions as GameAction[]) : [];
};

describe('GameAiService', () => {
  let service: GameAiService;
  let onnxPolicyMock: jest.Mocked<OnnxPolicyService>;

  beforeEach(() => {
    onnxPolicyMock = {
      predictAction: jest.fn().mockRejectedValue(new Error('onnx not used')),
    } as unknown as jest.Mocked<OnnxPolicyService>;
    service = new GameAiService(new GameEngineService(), onnxPolicyMock);
  });

  it('identifies whether it is currently an AI turn', () => {
    const aiTurnState = createState({ currentPlayerIndex: 1 });
    const humanTurnState = createState({ currentPlayerIndex: 0 });

    expect(service.isAiTurn(aiTurnState)).toBe(true);
    expect(service.isAiTurn(humanTurnState)).toBe(false);
  });

  it('returns null when the game is not in single mode', async () => {
    const state = createState({
      currentPlayerIndex: 1,
      settings: { ...baseSettings, mode: 'multi' },
    });

    await expect(service.playWhileAiTurn(state)).resolves.toBeNull();
  });

  it('returns null when the current player is not an AI', async () => {
    const players = [
      createPlayer({ id: 'me', name: 'Me', isAI: false, isSelf: true }),
      createPlayer({ id: 'cpu', name: 'CPU', isAI: true }),
    ];
    const state = createState({
      players,
      currentPlayerIndex: 0,
    });

    await expect(service.playWhileAiTurn(state)).resolves.toBeNull();
  });

  it('plays a valid card and passes control when the AI still has cards', async () => {
    const playableCard = createCard('card-1', 5, 'hearts');
    const spareCard = createCard('card-2', 9, 'clubs');
    const state = createState({
      players: [
        createPlayer({
          id: 'me',
          name: 'Me',
          isAI: false,
          isSelf: true,
          hand: [createCard('human-card', 4, 'spades')],
        }),
        createPlayer({
          id: 'cpu',
          name: 'CPU',
          hand: [spareCard, playableCard],
          isAI: true,
        }),
      ],
      currentPlayerIndex: 1,
      discardPile: [createCard('top', 8, 'hearts')],
    });

    const result = await ensureResult(service.playWhileAiTurn(state));
    const actions = extractAiActions(result);
    expect(actions.map((action) => action.type)).toEqual([
      'PLAY_CARD',
      'NEXT_TURN',
    ]);

    const aiPlayer = result.state.players[1];
    expect(aiPlayer.hand).toHaveLength(1);
    expect(aiPlayer.hand[0].id).toBe(spareCard.id);
    expect(result.state.discardPile[0].id).toBe(playableCard.id);
    expect(result.state.currentPlayerIndex).toBe(0);
    expect(result.state.gameStatus).toBe('playing');
  });

  it('finishes the game when the AI plays its last card', async () => {
    const playableCard = createCard('card-last', 5, 'hearts');
    const state = createState({
      players: [
        createPlayer({
          id: 'me',
          name: 'Me',
          isAI: false,
          isSelf: true,
          hand: [createCard('human-card', 7, 'hearts')],
        }),
        createPlayer({
          id: 'cpu',
          name: 'CPU',
          hand: [playableCard],
          isAI: true,
        }),
      ],
      currentPlayerIndex: 1,
      discardPile: [createCard('top', 8, 'hearts')],
    });

    const result = await ensureResult(service.playWhileAiTurn(state));
    const actions = extractAiActions(result);
    expect(actions.map((action) => action.type)).toEqual(['PLAY_CARD']);
    expect(result.done).toBe(true);
    expect(result.state.gameStatus).toBe('finished');
    expect(result.state.winner?.id).toBe('cpu');
  });

  it('draws cards when blocked, then plays once a card becomes available', async () => {
    const unplayableCard = createCard('blocker', 3, 'clubs');
    const drawnPlayableCard = createCard('drawn', 7, 'diamonds');
    const extraDrawnCard = createCard('drawn-2', 9, 'clubs');

    const state = createState({
      players: [
        createPlayer({
          id: 'me',
          name: 'Me',
          isAI: false,
          isSelf: true,
          hand: [createCard('human-card', 4, 'spades')],
        }),
        createPlayer({
          id: 'cpu',
          name: 'CPU',
          hand: [unplayableCard],
          isAI: true,
        }),
      ],
      currentPlayerIndex: 1,
      discardPile: [createCard('top', 10, 'diamonds')],
      deck: [drawnPlayableCard, extraDrawnCard],
      damage: 2,
    });

    const result = await ensureResult(service.playWhileAiTurn(state));
    const actions = extractAiActions(result);
    expect(actions.map((action) => action.type)).toEqual([
      'DRAW_CARD',
      'PLAY_CARD',
      'NEXT_TURN',
    ]);

    const aiPlayer = result.state.players[1];
    expect(aiPlayer.hand).toHaveLength(2);
    expect(result.state.deck).toHaveLength(0);
    expect(result.state.damage).toBe(0);
    expect(result.state.discardPile[0].id).toBe(drawnPlayableCard.id);
    expect(result.state.currentPlayerIndex).toBe(0);
    expect(result.state.gameStatus).toBe('playing');
  });

  it('uses ONNX policy on medium difficulty and returns action info', async () => {
    const state = createState({
      settings: { ...baseSettings, difficulty: 'medium' },
      currentPlayerIndex: 1,
      players: [
        createPlayer({ id: 'me', name: 'Me', isAI: false, isSelf: true }),
        createPlayer({ id: 'cpu', name: 'CPU', isAI: true, hand: [] }),
      ],
      deck: [createCard('deck', 5, 'hearts')],
      discardPile: [createCard('top', 9, 'clubs')],
    });

    onnxPolicyMock.predictAction.mockResolvedValue({
      actionIndex: 15,
      logits: [],
      payload: { type: 'DRAW_CARD', amount: 1 },
    });

    const result = await ensureResult(service.playWhileAiTurn(state));

    const predictMock: jest.MockedFunction<OnnxPolicyService['predictAction']> =
      onnxPolicyMock.predictAction as unknown as jest.MockedFunction<
        OnnxPolicyService['predictAction']
      >;
    expect(predictMock.mock.calls.length).toBeGreaterThan(0);
    expect(extractAiActions(result).map((a) => a.type)).toEqual(['DRAW_CARD']);
    expect(result.info?.source).toBe('onnx');
  });

  it('falls back to rule-based play when ONNX predict fails', async () => {
    const playableCard = createCard('card-1', 5, 'hearts');
    const state = createState({
      settings: { ...baseSettings, difficulty: 'medium' },
      players: [
        createPlayer({ id: 'me', name: 'Me', isAI: false, isSelf: true }),
        createPlayer({
          id: 'cpu',
          name: 'CPU',
          isAI: true,
          hand: [playableCard],
        }),
      ],
      currentPlayerIndex: 1,
      discardPile: [createCard('top', 8, 'hearts')],
    });

    onnxPolicyMock.predictAction.mockRejectedValue(new Error('model missing'));

    const result = await ensureResult(service.playWhileAiTurn(state));

    const predictMock: jest.MockedFunction<OnnxPolicyService['predictAction']> =
      onnxPolicyMock.predictAction as unknown as jest.MockedFunction<
        OnnxPolicyService['predictAction']
      >;
    expect(predictMock.mock.calls.length).toBeGreaterThan(0);
    expect(extractAiActions(result).map((a) => a.type)).toContain('PLAY_CARD');
    expect(result.info?.source).toBe('fallback');
  });
});
