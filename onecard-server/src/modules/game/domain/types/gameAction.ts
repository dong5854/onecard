import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PLAY_CARD'; payload: { playerIndex: number; cardIndex: number } }
  | { type: 'DRAW_CARD'; payload: { amount: number } }
  | { type: 'NEXT_TURN' }
  | {
      type: 'APPLY_SPECIAL_EFFECT';
      payload: { effectCard: PokerCardPropsWithId };
    }
  | { type: 'END_GAME'; payload: { winnerIndex: number } };
