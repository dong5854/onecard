import { GameState } from '@/modules/game/domain/types/gameState';
import {
  attackValue,
  changeDirection,
  turnSpecialEffect,
} from '@/modules/game/domain/utils/cardUtils';
import { PokerCardProps } from '@/modules/game/domain/types/pokerCard';

export const applySpecialEffectStatus = (
  state: GameState,
  effectCard: PokerCardProps,
): GameState => {
  return {
    ...state,
    currentPlayerIndex: turnSpecialEffect(effectCard, state),
    direction: changeDirection(effectCard, state.direction),
    damage: state.damage + attackValue(effectCard),
  };
};
