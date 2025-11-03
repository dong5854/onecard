import { GameState } from '@/types/gameState';
import { PokerCardPropsWithId } from '@/types/pokerCard';
import { refillDeck } from '@/lib/utils/cardUtils';
import { Player } from '@/types/gamePlayer';

interface DrawResult {
	updatedPlayer: Player;
	remainingDeck: PokerCardPropsWithId[];
	discardPile: PokerCardPropsWithId[];
	drawnCard: PokerCardPropsWithId | null;
}

export const drawCardStatus = (state: GameState, amount: number): GameState => {
	let updatedState = { ...state };
	for (let i = 0; i < amount; i++) {
		const { updatedPlayer, remainingDeck, discardPile, drawnCard } =
			drawCard(updatedState);
		if (!drawnCard) {
			return {
				...updatedState,
				deck: remainingDeck,
				discardPile,
				damage: 0,
			};
		}
		updatedState = {
			...updatedState,
			players: updatePlayers(
				updatedState.players,
				updatedState.currentPlayerIndex,
				updatedPlayer,
			),
			deck: remainingDeck,
			discardPile,
		};
	}
	return {
		...updatedState,
		damage: 0,
	};
};

const drawCard = (state: GameState): DrawResult => {
	const currentPlayer = state.players[state.currentPlayerIndex];
	let deck = state.deck;
	let discardPile = state.discardPile;

	if (deck.length === 0) {
		const refilled = refillDeck(deck, discardPile);
		deck = refilled.newDeck;
		discardPile = refilled.newDiscardPile;
	}

	if (deck.length === 0) {
		return {
			updatedPlayer: currentPlayer,
			remainingDeck: deck,
			discardPile,
			drawnCard: null,
		};
	}

	const [drawnCard, ...remainingDeck] = deck;

	const updatedPlayer = {
		...currentPlayer,
		hand: [...currentPlayer.hand, drawnCard],
	};

	return {
		updatedPlayer,
		remainingDeck,
		discardPile,
		drawnCard,
	};
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
