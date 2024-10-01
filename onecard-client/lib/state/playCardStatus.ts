import { GameState } from '@/types/gameState';
import { checkWinner } from '@/lib/utils/cardUtils';

export const playCardStatus = (
	state: GameState,
	playerIndex: number,
	cardIndex: number,
): GameState => {
	const player = state.players[playerIndex];
	const playedCard = player.hand[cardIndex];

	const updatedPlayersAfterPlayCard = state.players.map((p, index) =>
		index === playerIndex
			? { ...p, hand: p.hand.filter((_, i) => i !== cardIndex) }
			: p,
	);
	const updatedDiscardPile = [playedCard, ...state.discardPile];
	const winner = checkWinner(updatedPlayersAfterPlayCard);
	if (winner) {
		return {
			...state,
			players: updatedPlayersAfterPlayCard,
			discardPile: updatedDiscardPile,
			gameStatus: 'finished',
			winner: winner,
		};
	}
	return {
		...state,
		players: updatedPlayersAfterPlayCard,
		discardPile: updatedDiscardPile,
	};
};
