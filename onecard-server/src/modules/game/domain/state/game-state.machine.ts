import type { GameState } from '@/modules/game/domain/types/gameState';
import type { GameAction } from '@/modules/game/domain/types/gameAction';

import {
  initializeGameState,
  startGame,
} from '@/modules/game/domain/state/createGameState';
import { playCardStatus } from '@/modules/game/domain/state/playCardStatus';
import { drawCardStatus } from '@/modules/game/domain/state/drawCardStatus';
import { nextTurnStatus } from '@/modules/game/domain/state/nextTurnStatus';
import { applySpecialEffectStatus } from '@/modules/game/domain/state/applySpecialEffectStatus';
import { endGameStatus } from '@/modules/game/domain/state/endGameStatus';

export const transitionGameState = (
  state: GameState,
  action: GameAction,
): GameState => {
  switch (action.type) {
    case 'START_GAME':
      return startGame(initializeGameState(state.settings));

    case 'PLAY_CARD': {
      const { playerIndex, cardIndex } = action.payload;
      return playCardStatus(state, playerIndex, cardIndex);
    }

    case 'DRAW_CARD': {
      const { amount } = action.payload;
      return drawCardStatus(state, amount);
    }

    case 'NEXT_TURN':
      return nextTurnStatus(state);

    case 'APPLY_SPECIAL_EFFECT': {
      const { effectCard } = action.payload;
      return applySpecialEffectStatus(state, effectCard);
    }

    case 'END_GAME':
      return endGameStatus(state, action);

    default:
      return state;
  }
};
