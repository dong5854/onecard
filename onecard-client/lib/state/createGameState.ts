import { GameSettings, GameState } from '@/types/gameState';
import { createDeck, dealCards, shuffleDeck } from '@/lib/utils/cardUtils';
import { Player } from '@/types/gamePlayer';
import { PokerCardPropsWithId } from '@/types/pokerCard';
import { createAIPlayer, createMyself } from './gamePlayers';

export const createGameState = (settings: GameSettings): GameState => {
	return {
		players: [],
		currentPlayerIndex: 0,
		deck: [],
		discardPile: [],
		direction: 'clockwise',
		damage: 0,
		gameStatus: 'waiting',
		settings,
		winner: undefined,
	};
};

export const initializeGameState = (settings: GameSettings): GameState => {
	if (settings.mode === 'single') {
		return initializeSinglePlayGame(settings);
	}
	// TODO: initializeMultiPlayGame 함수 추가
	return initializeSinglePlayGame(settings);
};

export const startGame = (state: GameState): GameState => {
	const discardPile = [state.deck.pop()!];
	return {
		...state,
		discardPile,
		gameStatus: 'playing',
	};
};

export const updatePlayers = (
	state: GameState,
	players: Player[],
): GameState => {
	return {
		...state,
		players,
	};
};

export const updateDeck = (
	state: GameState,
	deck: PokerCardPropsWithId[],
): GameState => {
	return {
		...state,
		deck,
	};
};

function initializeSinglePlayGame(settings: GameSettings): GameState {
	const deck = shuffleDeck(createDeck(settings.includeJokers));
	const players = initializePlayerRoles(settings.numberOfPlayers);
	const { updatedPlayers, updatedDeck } = dealCards(
		players,
		deck,
		settings.initHandSize,
	);

	return {
		players: updatedPlayers,
		currentPlayerIndex: 0,
		deck: updatedDeck,
		discardPile: [],
		direction: 'clockwise',
		damage: 0,
		gameStatus: 'waiting',
		settings,
		winner: undefined,
	};
}

function initializePlayerRoles(numberOfPlayers: number): Player[] {
	const players: Player[] = [];
	for (let i = 0; i < numberOfPlayers; i++) {
		if (i === 0) {
			players.push(createMyself(`player-${i}`, 'me', []));
		} else {
			players.push(createAIPlayer(`player-${i}`, `cpu-${i}`, [], 'easy'));
		}
	}
	return players;
}
