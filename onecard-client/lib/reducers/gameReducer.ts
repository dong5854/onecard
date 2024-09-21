import { GameState } from '@/types/gameState';
import { GameAction } from '@/types/gameAction';
import { Player } from '@/types/gamePlayer';
import { PokerCardPropsWithId } from '@/types/pokerCard';
import {
	attackValue,
	changeDirection,
	checkWinner,
	getNextPlayerIndex,
	refillDeck,
	turnSpecialEffect,
} from '@/lib/utils/cardUtils';
import { initializeGameState, startGame } from '@/lib/state/createGameState';

export const gameReducer = (
	state: GameState,
	action: GameAction,
): GameState => {
	switch (action.type) {
		case 'START_GAME':
			return startGame(initializeGameState(state.settings));

		case 'PLAY_CARD':
			const { playerIndex, cardIndex } = action.payload;
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

		case 'DRAW_CARD':
			const { amount } = action.payload;
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

		case 'NEXT_TURN':
			return {
				...state,
				currentPlayerIndex: getNextPlayerIndex(state),
			};

		case 'APPLY_SPECIAL_EFFECT':
			const { effectCard } = action.payload;
			return {
				...state,
				currentPlayerIndex: turnSpecialEffect(effectCard, state),
				direction: changeDirection(effectCard, state.direction),
				damage: state.damage + attackValue(effectCard),
			};

		case 'END_GAME':
			return {
				...state,
				gameStatus: 'finished',
				winner: state.players[action.payload.winnerIndex],
			};

		default:
			return state;
	}
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

const updatePlayers = (
	players: Player[],
	currentPlayerIndex: number,
	updatedPlayer: Player,
) => {
	return players.map((p, index) =>
		index === currentPlayerIndex ? updatedPlayer : p,
	);
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
