import { GameState } from '@/types/gameState';
import { getNextPlayerIndex } from '@/lib/utils/cardUtils';

export const nextTurnStatus = (state: GameState): GameState => {
	return {
		...state,
		currentPlayerIndex: getNextPlayerIndex(state),
	};
};
