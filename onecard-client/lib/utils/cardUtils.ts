import { Player } from '@/types/gamePlayer';
import { Direction, GameState } from '@/types/gameState';
import {
	PokerCardProps,
	PokerCardPropsWithId,
	RankValue,
	SuitsValue,
} from '@/types/pokerCard';

export const createDeck = (includeJokers: boolean): PokerCardPropsWithId[] => {
	const suits: SuitsValue[] = ['hearts', 'diamonds', 'clubs', 'spades'];
	const ranks: RankValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

	let deck: PokerCardPropsWithId[] = suits.flatMap(suit =>
		ranks.map(rank => ({
			id: crypto.randomUUID(),
			suit,
			rank,
			isJoker: false,
			isFlipped: true,
			draggable: false,
		})),
	);

	if (includeJokers) {
		deck.push(
			{
				id: crypto.randomUUID(),
				isJoker: true,
				isFlipped: true,
				draggable: false,
			},
			{
				id: crypto.randomUUID(),
				isJoker: true,
				isFlipped: true,
				draggable: false,
			},
		);
	}

	return deck;
};

export const shuffleDeck = (
	deck: PokerCardPropsWithId[],
): PokerCardPropsWithId[] => {
	const shuffled = [...deck];
	for (let i = shuffled.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
	}
	return shuffled;
};

export const refillDeck = (
	currentDeck: PokerCardPropsWithId[],
	discardPile: PokerCardPropsWithId[],
): {
	newDeck: PokerCardPropsWithId[];
	newDiscardPile: PokerCardPropsWithId[];
} => {
	if (discardPile.length === 0) {
		return { newDeck: currentDeck, newDiscardPile: [] };
	}

	const cardsToShuffle = [...currentDeck, ...discardPile.slice(1)];
	const shuffledDeck = shuffleDeck(cardsToShuffle);
	const newDiscardPile = [discardPile[0]];

	return {
		newDeck: shuffledDeck,
		newDiscardPile: newDiscardPile,
	};
};

export const dealCards = (
	players: Player[],
	deck: PokerCardPropsWithId[],
	initHandSize: number,
): { updatedPlayers: Player[]; updatedDeck: PokerCardPropsWithId[] } => {
	const updatedPlayers = players.map((player, idx) => ({
		...player,
		hand: deck.slice(idx * initHandSize, idx * initHandSize + initHandSize),
	}));

	const updatedDeck = deck.slice(players.length * initHandSize);

	return { updatedPlayers, updatedDeck };
};

export const isAbleToBlock = (
	playedCard: PokerCardProps,
	topCard: PokerCardProps,
	damage: number,
): boolean => {
	if (topCard.rank === 2) {
		return (
			playedCard.rank === 2 ||
			(playedCard.suit === topCard.suit && playedCard.rank === 1)
		);
	} else if (topCard.rank === 1) {
		return playedCard.rank === 1;
	}
	return playedCard.isJoker;
};

export const attackValue = (card: PokerCardProps): number => {
	if (card.rank === 2) return 2; // 2 는 2장
	if (card.rank === 1) return 5; // A 는 5장
	if (card.isJoker) return 7; // 조커는 7장
	return 0;
};

export const changeDirection = (
	card: PokerCardProps,
	curDirection: Direction,
): Direction => {
	if (card.rank === 12)
		return curDirection === 'clockwise' ? 'counterclockwise' : 'clockwise'; // Q 에서 반전
	return curDirection;
};

export const turnSpecialEffect = (
	card: PokerCardProps,
	state: GameState,
): number => {
	if (card.rank === 11) return getNextPlayerIndex(state);
	else if (card.rank === 13) return getPrevPlayerIndex(state);
	return state.currentPlayerIndex;
};

// 카드의 유효성 검사 함수
export const isValidPlay = (
	playedCard: PokerCardProps,
	topCard: PokerCardProps,
	damage: number,
): boolean => {
	if (playedCard.isJoker) return true;
	if (damage > 0) return isAbleToBlock(playedCard, topCard, damage);
	if (!playedCard.rank || !playedCard.suit || !topCard.rank || !topCard.suit)
		return false;
	return playedCard.rank === topCard.rank || playedCard.suit === topCard.suit;
};

export const checkWinner = (players: Player[]): Player | null => {
	const winner = players.find(player => player.hand.length === 0);
	return winner || null;
};

export const getNextPlayerIndex = (state: GameState): number => {
	const playerCount = state.players.length;
	if (state.direction === 'clockwise') {
		return (state.currentPlayerIndex + 1) % playerCount;
	} else {
		return (state.currentPlayerIndex - 1 + playerCount) % playerCount;
	}
};

export const getPrevPlayerIndex = (state: GameState): number => {
	const playerCount = state.players.length;
	if (state.direction === 'clockwise') {
		return (state.currentPlayerIndex - 1 + playerCount) % playerCount;
	} else {
		return (state.currentPlayerIndex + 1) % playerCount;
	}
};
