// 기본 게임 요소 정의
export const suits = {
    clubs: '♣',
    diamonds: '♦',
    hearts: '♥',
    spades: '♠',
} as const;

export const ranks = {
    1: 'A', 2: '2', 3: '3', 4: '4', 5: '5',
    6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
    11: 'J', 12: 'Q', 13: 'K'
} as const;

export const colors = {
    clubs: 'black',
    diamonds: 'red',
    hearts: 'red',
    spades: 'black',
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
    onDragStart?: () => void;
    onDrag?: (clientX: number, clientY: number) => void;
    onDragEnd?: () => void;
    onClick?: () => void;
}

// 플레이어 관련 정의
export interface Player {
    id: string;
    name: string;
    hand: PokerCardProps[];
    isAI: boolean;
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';

export interface AIPlayer extends Player {
    difficulty: AIDifficulty;
}

// 게임 상태 및 설정 관련 정의
export type Direction = 'clockwise' | 'counterclockwise';
export type GameStatus = 'waiting' | 'playing' | 'finished';
export type SpecialEffect = 'drawTwo' | 'reverse' | 'skip' | 'wildcard';

export interface GameSettings {
    numberOfPlayers: number;
    includeJokers: boolean;
    maxHandSize: number;
}

export interface GameState {
    players: Player[];
    currentPlayerIndex: number;
    deck: PokerCardProps[];
    discardPile: PokerCardProps[];
    direction: Direction;
    gameStatus: GameStatus;
    settings: GameSettings;
    specialEffectInPlay?: SpecialEffect;
    winner?: Player;
}

// 게임 액션 정의
export type GameAction =
    | { type: 'INITIALIZE_GAME'; payload: GameSettings }
    | { type: 'PLAY_CARD'; payload: { playerIndex: number; cardIndex: number } }
    | { type: 'DRAW_CARD' }
    | { type: 'NEXT_TURN' }
    | { type: 'CHANGE_DIRECTION' }
    | { type: 'APPLY_SPECIAL_EFFECT'; payload: SpecialEffect }
    | { type: 'END_GAME'; payload: { winnerIndex: number } };