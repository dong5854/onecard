import { GameState, GameAction, Player, PokerCardProps } from '@/types/gameTypes';
import {createDeck, dealCards, shuffleDeck} from "@/lib/utils/cardUtils";

const initialState: GameState = {
    players: [],
    currentPlayerIndex: 0,
    deck: [],
    discardPile: [],
    direction: 'clockwise',
    gameStatus: 'waiting',
    settings: {
        numberOfPlayers: 4,
        includeJokers: false,
        initHandSize: 5,
        maxHandSize: 7
    }
};

    export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
    switch (action.type) {
        case 'INITIALIZE_GAME':
            const deck = shuffleDeck(createDeck(action.payload.includeJokers));
            const players = Array.from({ length: action.payload.numberOfPlayers }, (_, i) => ({
                id: `player-${i}`,
                name: `Player ${i + 1}`,
                hand: [],
                isAI: i !== 0 // 첫번째 플레이어만 사람이고, 나머지는 AI
            }));
            const { updatedPlayers, updatedDeck } = dealCards(players, deck, action.payload.initHandSize);
            return {
                ...state,
                players: updatedPlayers,
                deck: updatedDeck,
                discardPile: [updatedDeck.pop()!],
                gameStatus: 'playing',
                settings: action.payload
            };

        case 'PLAY_CARD':
            const { playerIndex, cardIndex } = action.payload;
            const player = state.players[playerIndex];
            const playedCard = player.hand[cardIndex];
            const updatedPlayer = {
                ...player,
                hand: player.hand.filter((_, index) => index !== cardIndex)
            };
            return {
                ...state,
                players: state.players.map((p, index) => index === playerIndex ? updatedPlayer : p),
                discardPile: [playedCard, ...state.discardPile]
            };

        case 'DRAW_CARD':
            const currentPlayer = state.players[state.currentPlayerIndex];
            const drawnCard = state.deck[0];
            const updatedCurrentPlayer = {
                ...currentPlayer,
                hand: [...currentPlayer.hand, drawnCard]
            };
            return {
                ...state,
                players: state.players.map((p, index) =>
                    index === state.currentPlayerIndex ? updatedCurrentPlayer : p
                ),
                deck: state.deck.slice(1)
            };

        case 'NEXT_TURN':
            const nextPlayerIndex = getNextPlayerIndex(state);
            return {
                ...state,
                currentPlayerIndex: nextPlayerIndex
            };

        case 'CHANGE_DIRECTION':
            return {
                ...state,
                direction: state.direction === 'clockwise' ? 'counterclockwise' : 'clockwise'
            };

        case 'APPLY_SPECIAL_EFFECT':
            // TODO: 추후 구현
            return state;

        case 'END_GAME':
            return {
                ...state,
                gameStatus: 'finished',
                winner: state.players[action.payload.winnerIndex]
            };

        default:
            return state;
    }
};

const getNextPlayerIndex = (state: GameState): number => {
    const playerCount = state.players.length;
    if (state.direction === 'clockwise') {
        return (state.currentPlayerIndex + 1) % playerCount;
    } else {
        return (state.currentPlayerIndex - 1 + playerCount) % playerCount;
    }
};