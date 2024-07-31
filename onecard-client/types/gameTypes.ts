export const suits = {
    clubs: '♣',
    hearts: '♥',
    diamonds: '♦',
    spades: '♠',
} as const;

export const ranks = {
    1: 'A', 2: '2', 3: '3', 4: '4', 5: '5',
    6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
    11: 'J', 12: 'Q', 13: 'K'
} as const;

export const colors = {
    spades: 'black',
    hearts: 'red',
    diamonds: 'red',
    clubs: 'black',
} as const;

export type RankValue = keyof typeof ranks;
export type SuitsValue = keyof typeof suits;

export const isValidRank = (rank: any): rank is RankValue => {
    return rank in ranks;
}

export const isValidSuit = (suit: any): suit is SuitsValue => {
    return suit in suits;
}

export type PokerCardProps = {
    isJoker: boolean;
    isFlipped: boolean;
    rank?: RankValue;
    suit?: SuitsValue;
    draggable?: boolean;
    onClick?: () => void;
}