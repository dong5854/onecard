import { encodeObservation, buildObservationSpec } from './observation-encoder';
import type { GameState } from '@/modules/game/domain/types/gameState';
import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';

const card = (
  overrides: Partial<PokerCardPropsWithId>,
): PokerCardPropsWithId => ({
  id: overrides.id ?? 'c1',
  isJoker: overrides.isJoker ?? false,
  isFlipped: overrides.isFlipped ?? true,
  rank: overrides.rank,
  suit: overrides.suit,
});

describe('observation-encoder', () => {
  it('encodes a sample state and matches vector size', () => {
    const state: GameState = {
      settings: {
        mode: 'single',
        numberOfPlayers: 3,
        includeJokers: true,
        initHandSize: 5,
        maxHandSize: 15,
        difficulty: 'medium',
      },
      players: [
        {
          id: 'me',
          name: 'me',
          isSelf: true,
          isAI: false,
          hand: [
            card({ id: 'h1', rank: 3, suit: 'hearts' }),
            card({ id: 'h2', rank: 1, suit: 'spades' }),
            card({ id: 'h3', isJoker: true }),
          ],
        },
        {
          id: 'cpu1',
          name: 'cpu1',
          isSelf: false,
          isAI: true,
          hand: [card({ id: 'c1', rank: 4, suit: 'clubs' })],
          difficulty: 'medium',
        },
        {
          id: 'cpu2',
          name: 'cpu2',
          isSelf: false,
          isAI: true,
          hand: [card({ id: 'd1', rank: 7, suit: 'diamonds' })],
          difficulty: 'medium',
        },
      ],
      currentPlayerIndex: 0,
      deck: [card({ id: 'deck1', rank: 2, suit: 'clubs' })],
      discardPile: [card({ id: 'top1', rank: 3, suit: 'spades' })],
      direction: 'clockwise',
      damage: 0,
      gameStatus: 'playing',
      winner: undefined,
    };

    const spec = buildObservationSpec(state.settings);
    const obs = encodeObservation(state, spec);

    expect(obs.length).toBe(spec.vectorSize);
    expect(obs.every((v) => v >= 0 && v <= 1)).toBe(true);
    expect(Array.from(obs)).toMatchInlineSnapshot(`
     [
       0.06666667014360428,
       0,
       0.06666667014360428,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0.06666667014360428,
       0.06666667014360428,
       0.06666667014360428,
       0,
       0,
       1,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       0,
       1,
       0,
       0,
       1,
       1,
       0,
       0,
       0.02631578966975212,
       0.06666667014360428,
       0.06666667014360428,
     ]
    `);
  });
});
