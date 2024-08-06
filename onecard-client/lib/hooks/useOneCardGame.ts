import { useReducer, useEffect, useCallback } from 'react';
import { gameReducer } from '../reducers/gameReducer';
import { GameState, Player } from '@/types/gameTypes';
import { isValidPlay, applySpecialCardEffect, checkWinner } from '@/lib/utils/cardUtils';

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
        initHandSize : 5,
        maxHandSize: 7
    }
};

export const useOneCardGame = () => {
    const [gameState, dispatch] = useReducer(gameReducer, initialState);

    const initializeGame = useCallback((settings: GameState['settings']) => {
        dispatch({ type: 'INITIALIZE_GAME', payload: settings });
    }, []);

    const playCard = useCallback((playerIndex: number, cardIndex: number) => {
        const player = gameState.players[playerIndex];
        const card = player.hand[cardIndex];
        const topCard = gameState.discardPile[0];

        if (isValidPlay(card, topCard)) {
            dispatch({ type: 'PLAY_CARD', payload: { playerIndex, cardIndex } });

            const effect = applySpecialCardEffect(card);
            if (effect) {
                dispatch({ type: 'APPLY_SPECIAL_EFFECT', payload: effect });
            }

            const winner = checkWinner(gameState.players);
            if (winner) {
                dispatch({ type: 'END_GAME', payload: { winnerIndex: playerIndex } });
            } else {
                dispatch({ type: 'NEXT_TURN' });
            }
        }
    }, [gameState]);

    // 카드 뽑기
    const drawCard = useCallback(() => {
        dispatch({ type: 'DRAW_CARD' });
        dispatch({ type: 'NEXT_TURN' });
    }, []);

    const changeDirection = useCallback(() => {
        dispatch({ type: 'CHANGE_DIRECTION' });
    }, []);

    const getCurrentPlayer = useCallback((): Player => {
        return gameState.players[gameState.currentPlayerIndex];
    }, [gameState.players, gameState.currentPlayerIndex]);

    const getNextPlayerIndex = useCallback((): number => {
        const playerCount = gameState.players.length;
        if (gameState.direction === 'clockwise') {
            return (gameState.currentPlayerIndex + 1) % playerCount;
        } else {
            return (gameState.currentPlayerIndex - 1 + playerCount) % playerCount;
        }
    }, [gameState.players.length, gameState.currentPlayerIndex, gameState.direction]);

    const handleAITurn = useCallback(() => {
        const currentPlayer = getCurrentPlayer();
        if (currentPlayer.isAI) {
            const validCardIndex = currentPlayer.hand.findIndex(card =>
                isValidPlay(card, gameState.discardPile[0])
            );

            if (validCardIndex !== -1) {
                playCard(gameState.currentPlayerIndex, validCardIndex);
            } else {
                drawCard();
            }
        }
    }, [gameState, getCurrentPlayer, playCard, drawCard]);

    useEffect(() => {
        if (gameState.gameStatus === 'playing' && getCurrentPlayer().isAI) {
            const timeoutId = setTimeout(handleAITurn, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [gameState, getCurrentPlayer, handleAITurn]);

    return {
        gameState,
        initializeGame,
        playCard,
        drawCard,
        changeDirection,
        getCurrentPlayer,
        getNextPlayerIndex
    };
};