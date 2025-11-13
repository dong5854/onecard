import { GameState } from '@/modules/game/domain/types/gameState';
import { getNextPlayerIndex } from '@/modules/game/domain/utils/cardUtils';

export const nextTurnStatus = (state: GameState): GameState => {
  return {
    ...state,
    currentPlayerIndex: getNextPlayerIndex(state),
  };
};
