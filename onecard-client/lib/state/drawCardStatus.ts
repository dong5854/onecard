import { GameState } from '@/types/gameState';
import { PokerCardPropsWithId } from '@/types/pokerCard';
import { refillDeck } from '@/lib/utils/cardUtils';
import { Player } from '@/types/gamePlayer';

export const drawCardStatus = (state: GameState, amount: number): GameState => {
	let updatedState = { ...state };
	for (let i = 0; i < amount; i++) {
		const { updatedPlayer, remainingDeck } = drawCard(updatedState);
		const { newDeck, newDiscardPile } = handleEmptyDeck(
			remainingDeck,
			updatedState.discardPile,
		);
		updatedState = {
			...updatedState,
			players: updatePlayers(
				updatedState.players,
				updatedState.currentPlayerIndex,
				updatedPlayer,
			),
			deck: newDeck,
			discardPile: newDiscardPile,
		};
	}
	return {
		...updatedState,
		damage: 0,
	};
};

const drawCard = (state: GameState) => {
	const currentPlayer = state.players[state.currentPlayerIndex];
	const [drawnCard, ...remainingDeck] = state.deck;

	const updatedPlayer = {
		...currentPlayer,
		hand: [...currentPlayer.hand, drawnCard],
	};

	return {
		updatedPlayer,
		remainingDeck,
	};
};

const handleEmptyDeck = (
	remainingDeck: PokerCardPropsWithId[],
	discardPile: PokerCardPropsWithId[],
) => {
	if (remainingDeck.length === 0) {
		return refillDeck(remainingDeck, discardPile);
	}
	return { newDeck: remainingDeck, newDiscardPile: discardPile };
};

const updatePlayers = (
	players: Player[],
	currentPlayerIndex: number,
	updatedPlayer: Player,
) => {
	return players.map((p, index) =>
		index === currentPlayerIndex ? updatedPlayer : p,
	);
};
