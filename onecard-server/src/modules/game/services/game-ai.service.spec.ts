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

const ensureResult = (
  result: ReturnType<GameAiService['playWhileAiTurn']>,
): EngineStepResult => {
  if (!result) {
    throw new Error('Expected GameAiService to return an EngineStepResult.');
  }
  return result;
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

  beforeEach(() => {
    service = new GameAiService(new GameEngineService());
  });

  it('identifies whether it is currently an AI turn', () => {
    const aiTurnState = createState({ currentPlayerIndex: 1 });
    const humanTurnState = createState({ currentPlayerIndex: 0 });

    expect(service.isAiTurn(aiTurnState)).toBe(true);
    expect(service.isAiTurn(humanTurnState)).toBe(false);
  });

  it('returns null when the game is not in single mode', () => {
    const state = createState({
      currentPlayerIndex: 1,
      settings: { ...baseSettings, mode: 'multi' },
    });

    expect(service.playWhileAiTurn(state)).toBeNull();
  });

  it('returns null when the current player is not an AI', () => {
    const players = [
      createPlayer({ id: 'me', name: 'Me', isAI: false, isSelf: true }),
      createPlayer({ id: 'cpu', name: 'CPU', isAI: true }),
    ];
    const state = createState({
      players,
      currentPlayerIndex: 0,
    });

    expect(service.playWhileAiTurn(state)).toBeNull();
  });

  it('plays a valid card and passes control when the AI still has cards', () => {
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

    const result = ensureResult(service.playWhileAiTurn(state));
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

  it('finishes the game when the AI plays its last card', () => {
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

    const result = ensureResult(service.playWhileAiTurn(state));
    const actions = extractAiActions(result);
    expect(actions.map((action) => action.type)).toEqual(['PLAY_CARD']);
    expect(result.done).toBe(true);
    expect(result.state.gameStatus).toBe('finished');
    expect(result.state.winner?.id).toBe('cpu');
  });

  it('draws cards when blocked, then plays once a card becomes available', () => {
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

    const result = ensureResult(service.playWhileAiTurn(state));
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
});
