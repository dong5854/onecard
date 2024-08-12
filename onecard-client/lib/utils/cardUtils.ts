import {PokerCardPropsWithId, Player, SuitsValue, RankValue, SpecialEffect} from '@/types/gameTypes';

export const createDeck = (includeJokers: boolean): PokerCardPropsWithId[] => {
    const suits: SuitsValue[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: RankValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    let deck: PokerCardPropsWithId[] = suits.flatMap(suit =>
        ranks.map(rank => ({
            id : crypto.randomUUID(),
            suit,
            rank,
            isJoker: false,
            isFlipped: true,
            draggable: false
        }))
    );

    if (includeJokers) {
        deck.push(
            { id: crypto.randomUUID(), isJoker: true, isFlipped: true, draggable: false },
            { id: crypto.randomUUID(), isJoker: true, isFlipped: true, draggable: false }
        );
    }

    return deck;
};

export const shuffleDeck = (deck: PokerCardPropsWithId[]): PokerCardPropsWithId[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const refillDeck = (currentDeck : PokerCardPropsWithId[], discardPile: PokerCardPropsWithId[]): {
    newDeck: PokerCardPropsWithId[],
    newDiscardPile: PokerCardPropsWithId[]
} => {
    if (discardPile.length === 0) {
        return {newDeck : currentDeck, newDiscardPile : []};
    }

    const cardsToShuffle = [...currentDeck, ...discardPile.slice(1)];
    const shuffledDeck = shuffleDeck(cardsToShuffle);
    const newDiscardPile = [discardPile[0]];

    return {
        newDeck : shuffledDeck,
        newDiscardPile : newDiscardPile,
    }
}

export const dealCards = (
    players: Player[],
    deck: PokerCardPropsWithId[],
    initHandSize: number
): { updatedPlayers: Player[], updatedDeck: PokerCardPropsWithId[] } => {
    const updatedPlayers = players.map((player, idx) => ({
        ...player,
        hand: deck.slice(idx * initHandSize, idx * initHandSize + initHandSize)
    }));

    const updatedDeck = deck.slice(players.length * initHandSize);

    return { updatedPlayers, updatedDeck };
};

// 카드의 유효성 검사 함수
export const isValidPlay = (playedCard: PokerCardPropsWithId, topCard: PokerCardPropsWithId): boolean => {
    if (playedCard.isJoker) return true;
    if (!playedCard.rank || !playedCard.suit || !topCard.rank || !topCard.suit) return false;
    return playedCard.rank === topCard.rank || playedCard.suit === topCard.suit;
};

export const applySpecialCardEffect = (card: PokerCardPropsWithId): SpecialEffect | null => {
    if (!card.rank) return null;

    switch (card.rank) {
        case 2:
            return 'drawTwo';
        case 7:
            return 'reverse';
        case 11: // Jack
            return 'skip';
        case 1: // Ace
            return 'wildcard';
        default:
            return null;
    }
};

export const checkWinner = (players: Player[]): Player | null => {
    const winner = players.find(player => player.hand.length === 0);
    return winner || null;
};