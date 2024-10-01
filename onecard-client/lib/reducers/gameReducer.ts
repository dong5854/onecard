import { GameState } from '@/types/gameState';
import { GameAction } from '@/types/gameAction';

import { initializeGameState, startGame } from '@/lib/state/createGameState';
import { playCardStatus } from '@/lib/state/playCardStatus';
import { drawCardStatus } from '@/lib/state/drawCardStatus';
import { nextTurnStatus } from '@/lib/state/nextTurnStatus';
import { applySpecialEffectStatus } from '@/lib/state/applySpecialEffectStatus';
import { endGameStatus } from '@/lib/state/endGameStatus';

export const gameReducer = (
	state: GameState,
	action: GameAction,
): GameState => {
	switch (action.type) {
		case 'START_GAME':
			return startGame(initializeGameState(state.settings));

		case 'PLAY_CARD':
			const { playerIndex, cardIndex } = action.payload;
			return playCardStatus(state, playerIndex, cardIndex);

		case 'DRAW_CARD':
			const { amount } = action.payload;
			return drawCardStatus(state, amount);

		case 'NEXT_TURN':
			return nextTurnStatus(state);

		case 'APPLY_SPECIAL_EFFECT':
			const { effectCard } = action.payload;
			return applySpecialEffectStatus(state, effectCard);

		case 'END_GAME':
			return endGameStatus(state, action);

		default:
			return state;
	}
};
