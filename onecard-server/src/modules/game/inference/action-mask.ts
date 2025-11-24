import type { GameState } from '@/modules/game/domain/types/gameState';
import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';
import { isValidPlay } from '@/modules/game/domain/utils/cardUtils';

export const buildActionMask = (
  state: GameState,
  maxHandSize: number,
): boolean[] => {
  const mask: boolean[] = Array.from({ length: maxHandSize + 1 }, () => false);

  const hand: PokerCardPropsWithId[] = state.players[0]?.hand ?? [];

  if (!state.discardPile.length) {
    for (let i = 0; i < hand.length && i < maxHandSize; i++) {
      mask[i] = true;
    }
    mask[maxHandSize] = hand.length < maxHandSize;
    return mask;
  }

  const topCard = state.discardPile[0];
  const damage = state.damage;

  for (let i = 0; i < maxHandSize; i++) {
    if (i >= hand.length) {
      mask[i] = false;
      continue;
    }
    mask[i] = isValidPlay(hand[i], topCard, damage);
  }

  // 드로우는 손패가 maxHandSize에 도달하지 않았을 때만 허용
  mask[maxHandSize] = hand.length < maxHandSize;

  return mask;
};

export const applyActionMask = (
  logits: number[],
  mask: boolean[],
): number[] => {
  if (logits.length !== mask.length) {
    throw new Error(
      `logits length ${String(logits.length)} and mask length ${String(mask.length)} mismatch`,
    );
  }
  const NEG_INF = -1e9;
  return logits.map((v, idx) => (mask[idx] ? v : NEG_INF));
};

export const selectAction = (maskedLogits: number[]): number => {
  // argmax 선택; 필요하면 샘플링 구현 가능
  let bestIdx = 0;
  let bestVal = maskedLogits[0];
  for (let i = 1; i < maskedLogits.length; i++) {
    if (maskedLogits[i] > bestVal) {
      bestVal = maskedLogits[i];
      bestIdx = i;
    }
  }
  if (bestVal === -Infinity || bestVal <= -1e8) {
    throw new Error('No valid action after masking');
  }
  return bestIdx;
};

export interface EngineActionPayload {
  type: 'PLAY_CARD' | 'DRAW_CARD';
  playerIndex?: number;
  cardIndex?: number;
  amount?: number;
}

export const mapActionIndexToPayload = (
  actionIndex: number,
  state: GameState,
  maxHandSize: number,
): EngineActionPayload => {
  const hand = state.players[0]?.hand ?? [];
  if (actionIndex === maxHandSize) {
    return { type: 'DRAW_CARD', amount: 1 };
  }
  if (actionIndex < 0 || actionIndex >= maxHandSize) {
    throw new Error(`actionIndex ${String(actionIndex)} out of bounds`);
  }
  if (actionIndex >= hand.length) {
    // 마스킹이 제대로 되었다면 여기 오지 않아야 함
    throw new Error(
      `actionIndex ${String(actionIndex)} exceeds hand length ${String(hand.length)}`,
    );
  }
  return { type: 'PLAY_CARD', playerIndex: 0, cardIndex: actionIndex };
};
