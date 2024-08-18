import {GameState, GameAction, Player, PokerCardProps, PokerCardPropsWithId} from '@/types/gameTypes';
import {
    applySpecialCardEffect,
    checkWinner,
    createDeck,
    dealCards,
    refillDeck,
    shuffleDeck
} from "@/lib/utils/cardUtils";

const initialState: GameState = {
    players: [],
    currentPlayerIndex: 0,
    deck: [],
    discardPile: [],
    direction: 'clockwise',
    damage : 0,
    gameStatus: 'waiting',
    settings: {
        numberOfPlayers: 4,
        includeJokers: false,
        initHandSize: 5,
        maxHandSize: 7
    }
};

    export const gameReducer = (state: GameState = initialState, action: GameAction): GameState => {
    const nextPlayerIndex = getNextPlayerIndex(state)
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

            const updatedPlayersAfterPlayCard  = state.players.map((p, index) =>
                index === playerIndex
                    ? { ...p, hand: p.hand.filter((_, i) => i !== cardIndex) }
                    : p
            );
            const updatedDiscardPile = [playedCard, ...state.discardPile];

            const effect = applySpecialCardEffect(playedCard);
            const winner = checkWinner(updatedPlayersAfterPlayCard);
            if (winner) {
                return {
                    ...state,
                    players: updatedPlayersAfterPlayCard,
                    discardPile: updatedDiscardPile,
                    gameStatus: 'finished',
                    winner : winner
                };
            }
            return {
                ...state,
                players: updatedPlayersAfterPlayCard,
                discardPile: updatedDiscardPile,
                currentPlayerIndex: nextPlayerIndex
            };

        case 'ATTACK':
            const {damage} = action.payload;
            return {
                ...state,
                damage: state.damage + damage
            };

        case 'DRAW_CARD':
            const {amount} = action.payload;
            let updatedState = { ...state };

            for (let i = 0; i < amount; i++) {
                const { updatedPlayer, remainingDeck } = drawCard(state);
                const { newDeck, newDiscardPile } = handleEmptyDeck(remainingDeck, state.discardPile);
                updatedState = {
                    ...updatedState,
                    players: updatePlayers(updatedState.players, updatedState.currentPlayerIndex, updatedPlayer),
                    deck: newDeck,
                    discardPile: newDiscardPile,
                };
            }

            return {
                ...updatedState,
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

const drawCard = (state: GameState) => {
    const currentPlayer = state.players[state.currentPlayerIndex];
    const [drawnCard, ...remainingDeck] = state.deck;

    const updatedPlayer = {
        ...currentPlayer,
        hand: [...currentPlayer.hand, drawnCard]
    };

    return {
        updatedPlayer,
        remainingDeck
    };
};


const updatePlayers = (players: Player[], currentPlayerIndex : number, updatedPlayer: Player) => {
    return players.map((p, index) =>
        index === currentPlayerIndex ? updatedPlayer : p
    );
};

const handleEmptyDeck = (remainingDeck: PokerCardPropsWithId[], discardPile: PokerCardPropsWithId[]) => {
    if (remainingDeck.length === 0) {
        return refillDeck(remainingDeck, discardPile);
    }
    return { newDeck: remainingDeck, newDiscardPile: discardPile };
};
