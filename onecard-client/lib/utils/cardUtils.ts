import {PokerCardProps, Player, SuitsValue, RankValue, SpecialEffect} from '@/types/gameTypes';

export const createDeck = (includeJokers: boolean): PokerCardProps[] => {
    const suits: SuitsValue[] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const ranks: RankValue[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    let deck: PokerCardProps[] = suits.flatMap(suit =>
        ranks.map(rank => ({
            suit,
            rank,
            isJoker: false,
            isFlipped: true,
            draggable: false
        }))
    );

    if (includeJokers) {
        deck.push(
            { isJoker: true, isFlipped: true, draggable: false },
            { isJoker: true, isFlipped: true, draggable: false }
        );
    }

    return deck;
};

export const shuffleDeck = (deck: PokerCardProps[]): PokerCardProps[] => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
};

export const dealCards = (
    players: Player[],
    deck: PokerCardProps[],
    handSize: number
): { updatedPlayers: Player[], updatedDeck: PokerCardProps[] } => {
    const updatedPlayers = players.map(player => ({
        ...player,
        hand: deck.slice(player.hand.length, player.hand.length + handSize)
    }));

    const updatedDeck = deck.slice(players.length * handSize);

    return { updatedPlayers, updatedDeck };
};

// 카드의 유효성 검사 함수
export const isValidPlay = (playedCard: PokerCardProps, topCard: PokerCardProps): boolean => {
    if (playedCard.isJoker) return true;
    if (!playedCard.rank || !playedCard.suit || !topCard.rank || !topCard.suit) return false;
    return playedCard.rank === topCard.rank || playedCard.suit === topCard.suit;
};

export const applySpecialCardEffect = (card: PokerCardProps): SpecialEffect | null => {
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