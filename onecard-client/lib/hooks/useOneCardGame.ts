import { useReducer, useEffect, useCallback } from 'react';
import { gameReducer } from '../reducers/gameReducer';
import { GameSettings, GameState } from '@/types/gameState';
import { Player } from '@/types/gamePlayer';
import { PokerCardPropsWithId } from '@/types/pokerCard';
import { isValidPlay } from '@/lib/utils/cardUtils';
import { createGameState } from '../state/createGameState';
import { GameAction } from '@/types/gameAction';

export const useOneCardGame = (settings: GameSettings) => {
	const [gameState, dispatch] = useReducer<
		React.Reducer<GameState, GameAction>
	>(gameReducer, createGameState(settings));

	const initializeGame = useCallback(() => {
		dispatch({ type: 'START_GAME' });
	}, []);

	const applySpecialEffect = useCallback((effectCard: PokerCardPropsWithId) => {
		dispatch({ type: 'APPLY_SPECIAL_EFFECT', payload: { effectCard } });
	}, []);

	const playCard = useCallback(
		(playerIndex: number, cardIndex: number) => {
			const player = gameState.players[playerIndex];
			const card = player.hand[cardIndex];
			const topCard = gameState.discardPile[0];
			if (isValidPlay(card, topCard, gameState.damage)) {
				dispatch({ type: 'PLAY_CARD', payload: { playerIndex, cardIndex } });
				applySpecialEffect(card);
			}
			dispatch({ type: 'NEXT_TURN' });
		},
		[
			applySpecialEffect,
			gameState.damage,
			gameState.discardPile,
			gameState.players,
		],
	);

	// 카드 뽑기
	const drawCard = useCallback(() => {
		dispatch({
			type: 'DRAW_CARD',
			payload: { amount: gameState.damage > 0 ? gameState.damage : 1 },
		});
		dispatch({ type: 'NEXT_TURN' });
	}, [gameState.damage]);

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
	}, [
		gameState.players.length,
		gameState.currentPlayerIndex,
		gameState.direction,
	]);

	const handleAITurn = useCallback(() => {
		const currentPlayer = getCurrentPlayer();
		if (currentPlayer.isAI) {
			const validCardIndex = currentPlayer.hand.findIndex(card =>
				isValidPlay(card, gameState.discardPile[0], gameState.damage),
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
		getCurrentPlayer,
		getNextPlayerIndex,
	};
};
