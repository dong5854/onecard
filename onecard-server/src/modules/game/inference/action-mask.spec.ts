import {
  buildActionMask,
  applyActionMask,
  selectAction,
  mapActionIndexToPayload,
} from './action-mask';
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

describe('action-mask', () => {
  const baseState: GameState = {
    settings: {
      mode: 'single',
      numberOfPlayers: 2,
      includeJokers: false,
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
          card({ id: 'h2', rank: 3, suit: 'clubs' }),
        ],
      },
      {
        id: 'cpu',
        name: 'cpu',
        isSelf: false,
        isAI: true,
        hand: [],
        difficulty: 'medium',
      },
    ],
    currentPlayerIndex: 0,
    deck: [card({ id: 'd1', rank: 2, suit: 'spades' })],
    discardPile: [card({ id: 'top', rank: 3, suit: 'spades' })],
    direction: 'clockwise',
    damage: 0,
    gameStatus: 'playing',
    winner: undefined,
  };

  it('masks invalid plays and keeps draw true', () => {
    const mask = buildActionMask(baseState, 15);
    expect(mask[0]).toBe(true); // same rank
    expect(mask[1]).toBe(true); // same rank
    expect(mask[15]).toBe(true); // draw
    // beyond hand size should be false
    expect(mask[2]).toBe(false);
  });

  it('applies mask to logits and selects argmax', () => {
    const mask = buildActionMask(baseState, 15);
    const logits: number[] = Array.from({ length: mask.length }, () => -10);
    logits[0] = 1; // best valid
    logits[3] = 5; // but masked (invalid)

    const masked = applyActionMask(logits, mask);
    const action = selectAction(masked);
    expect(action).toBe(0);
  });

  it('maps action index to engine payload', () => {
    const payloadPlay = mapActionIndexToPayload(1, baseState, 15);
    expect(payloadPlay).toEqual({
      type: 'PLAY_CARD',
      playerIndex: 0,
      cardIndex: 1,
    });

    const payloadDraw = mapActionIndexToPayload(15, baseState, 15);
    expect(payloadDraw).toEqual({ type: 'DRAW_CARD', amount: 1 });
  });
});
