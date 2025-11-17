import { useCallback, useEffect, useRef, useState } from 'react';
import { GameSettings, GameState } from '@/types/gameState';
import { Player } from '@/types/gamePlayer';
import { isValidPlay } from '@/lib/utils/cardUtils';
import { PokerCardPropsWithId } from '@/types/pokerCard';
import { GameAction } from '@/types/gameAction';
import {
	applyGameAction,
	createGameSession,
	executeAiTurn,
	EffectCardPayload,
	RemoteGameAction,
} from '@/lib/api/gameSessions';

const AI_TURN_DELAY_MS = 500;
const AI_CHAIN_EXTRA_DELAY_MS = 600;

interface AiPlayIndicator {
	cardId: string | null;
	playerName: string | null;
	sequence: number;
}

export const useOneCardGame = (settings: GameSettings) => {
	const [gameId, setGameId] = useState<string | null>(null);
	const [gameState, setGameState] = useState<GameState | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isProcessingAction, setIsProcessingAction] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [aiTurnInProgress, setAiTurnInProgress] = useState(false);
	const [activeAiPlayerName, setActiveAiPlayerName] = useState<string | null>(
		null,
	);
	const [activeAiPlayerIndex, setActiveAiPlayerIndex] = useState<number | null>(
		null,
	);
	const [aiPlayIndicator, setAiPlayIndicator] =
		useState<AiPlayIndicator | null>(null);
	const [aiTurnCooldownKey, setAiTurnCooldownKey] = useState(0);

	const mountedRef = useRef(false);
	const aiTurnInFlightRef = useRef(false);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	const applyActions = useCallback(
		async (actions: RemoteGameAction[]): Promise<GameState | null> => {
			if (!gameId) {
				throw new Error('Game session is not initialized.');
			}

			let latestState: GameState | null = null;

			for (const action of actions) {
				const result = await applyGameAction(gameId, action);
				if (!mountedRef.current) {
					return null;
				}
				latestState = result.state;
				setGameState(result.state);
				if (result.done || result.state.gameStatus === 'finished') {
					break;
				}
			}

			return latestState;
		},
		[gameId],
	);

	const initializeGame = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		setGameId(null);
		setGameState(null);
		setAiTurnInProgress(false);
		setActiveAiPlayerName(null);
		setActiveAiPlayerIndex(null);
		setAiPlayIndicator(null);
		setAiTurnCooldownKey(0);

		try {
			const resource = await createGameSession(settings);
			if (!mountedRef.current) {
				return;
			}
			setGameId(resource.id);
			setGameState(resource.state);

			const started = await applyGameAction(resource.id, {
				type: 'START_GAME',
			});
			if (!mountedRef.current) {
				return;
			}
			setGameState(started.state);
		} catch (err) {
			if (mountedRef.current) {
				setError(getErrorMessage(err));
			}
		} finally {
			if (mountedRef.current) {
				setIsLoading(false);
				setIsProcessingAction(false);
			}
		}
	}, [settings]);

	const playCard = useCallback(
		async (playerIndex: number, cardIndex: number) => {
			if (!gameState || !gameId || isProcessingAction) {
				return;
			}

			const player = gameState.players[playerIndex];
			const card = player?.hand[cardIndex];
			const topCard = gameState.discardPile[0];
			if (!player || !card || !topCard) {
				return;
			}

			if (!isValidPlay(card, topCard, gameState.damage)) {
				return;
			}

			setIsProcessingAction(true);
			setError(null);

			try {
				const effectCardPayload = sanitizeEffectCard(card);
				await applyActions([
					{ type: 'PLAY_CARD', playerIndex, cardIndex },
					{ type: 'APPLY_SPECIAL_EFFECT', effectCard: effectCardPayload },
					{ type: 'NEXT_TURN' },
				]);
			} catch (err) {
				if (mountedRef.current) {
					setError(getErrorMessage(err));
				}
			} finally {
				if (mountedRef.current) {
					setIsProcessingAction(false);
				}
			}
		},
		[applyActions, gameId, gameState, isProcessingAction],
	);

	const drawCard = useCallback(async () => {
		if (!gameState || !gameId || isProcessingAction) {
			return;
		}

		const currentPlayer = gameState.players[gameState.currentPlayerIndex];
		if (!currentPlayer) {
			return;
		}

		const defaultDrawAmount = gameState.damage > 0 ? gameState.damage : 1;
		const availableSlots =
			gameState.settings.maxHandSize - currentPlayer.hand.length;
		const drawAmount = Math.min(defaultDrawAmount, availableSlots);

		setIsProcessingAction(true);
		setError(null);

		try {
			if (drawAmount <= 0) {
				await applyActions([{ type: 'NEXT_TURN' }]);
				return;
			}

			await applyActions([
				{ type: 'DRAW_CARD', amount: drawAmount },
				{ type: 'NEXT_TURN' },
			]);
		} catch (err) {
			if (mountedRef.current) {
				setError(getErrorMessage(err));
			}
		} finally {
			if (mountedRef.current) {
				setIsProcessingAction(false);
			}
		}
	}, [applyActions, gameId, gameState, isProcessingAction]);

	const getCurrentPlayer = useCallback((): Player | null => {
		if (!gameState) {
			return null;
		}
		return gameState.players[gameState.currentPlayerIndex] ?? null;
	}, [gameState]);

	const getNextPlayerIndex = useCallback((): number => {
		if (!gameState) {
			return 0;
		}
		const playerCount = gameState.players.length || 1;
		if (gameState.direction === 'clockwise') {
			return (gameState.currentPlayerIndex + 1) % playerCount;
		}
		return (gameState.currentPlayerIndex - 1 + playerCount) % playerCount;
	}, [gameState]);

	useEffect(() => {
		if (!gameId || !gameState) {
			return;
		}
		if (gameState.gameStatus !== 'playing') {
			return;
		}
		if (isProcessingAction || aiTurnInFlightRef.current) {
			return;
		}

		const currentPlayer = gameState.players[gameState.currentPlayerIndex];
		if (!currentPlayer || !currentPlayer.isAI) {
			return;
		}
		const previousPlayer = getPreviousPlayer(gameState);
		const isChainedAiTurn = previousPlayer?.isAI ?? false;

		let cancelled = false;
		aiTurnInFlightRef.current = true;
		setAiTurnInProgress(true);
		setActiveAiPlayerName(currentPlayer.name ?? 'AI');
		setActiveAiPlayerIndex(gameState.currentPlayerIndex);
		let holdNextTurnForAi = false;

		const runAiTurn = async () => {
			try {
				const delay =
					AI_TURN_DELAY_MS + (isChainedAiTurn ? AI_CHAIN_EXTRA_DELAY_MS : 0);
				await wait(delay);
				const result = await executeAiTurn(gameId);
				if (!mountedRef.current || cancelled) {
					return;
				}
				const info = result.info as { aiActions?: unknown } | undefined;
				const rawAiActions = info?.aiActions;
				const aiActions = Array.isArray(rawAiActions)
					? (rawAiActions as GameAction[])
					: [];
				const playedCard = aiActions.some(
					action => action.type === 'PLAY_CARD',
				);
				if (playedCard) {
					const nextTopCard = result.state.discardPile[0] ?? null;
					setAiPlayIndicator(prev => ({
						cardId: nextTopCard?.id ?? null,
						playerName: currentPlayer.name ?? 'AI',
						sequence: (prev?.sequence ?? 0) + 1,
					}));
				}
				if (!mountedRef.current || cancelled) {
					return;
				}
				setGameState(result.state);
				const nextPlayer =
					result.state.players[result.state.currentPlayerIndex];
				holdNextTurnForAi = Boolean(nextPlayer?.isAI);
			} catch (err) {
				if (!mountedRef.current || cancelled) {
					return;
				}
				setError(getErrorMessage(err));
			} finally {
				if (holdNextTurnForAi) {
					await wait(AI_CHAIN_EXTRA_DELAY_MS);
				}
				aiTurnInFlightRef.current = false;
				if (!mountedRef.current) {
					return;
				}
				setAiTurnInProgress(false);
				setActiveAiPlayerName(null);
				setActiveAiPlayerIndex(null);
				if (holdNextTurnForAi) {
					setAiTurnCooldownKey(prev => prev + 1);
				}
			}
		};

		void runAiTurn();

		return () => {
			cancelled = true;
		};
	}, [gameId, gameState, isProcessingAction, aiTurnCooldownKey]);

	return {
		gameId,
		gameState,
		isLoading,
		isProcessingAction,
		aiTurnInProgress,
		activeAiPlayerName,
		activeAiPlayerIndex,
		aiPlayIndicator,
		error,
		initializeGame,
		playCard,
		drawCard,
		getCurrentPlayer,
		getNextPlayerIndex,
	};
};

function wait(duration: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(resolve, duration);
	});
}

function getPreviousPlayer(state: GameState): Player | null {
	const playerCount = state.players.length;
	if (!playerCount) {
		return null;
	}
	const offset = state.direction === 'clockwise' ? -1 : 1;
	const previousIndex =
		(state.currentPlayerIndex + offset + playerCount) % playerCount;
	return state.players[previousIndex] ?? null;
}

function sanitizeEffectCard(card: PokerCardPropsWithId): EffectCardPayload {
	const payload: EffectCardPayload = {
		id: card.id,
		isJoker: card.isJoker,
		isFlipped: card.isFlipped,
	};
	if (typeof card.rank !== 'undefined') {
		payload.rank = card.rank;
	}
	if (typeof card.suit !== 'undefined') {
		payload.suit = card.suit;
	}
	return payload;
}

function getErrorMessage(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}
	if (typeof error === 'string') {
		return error;
	}
	try {
		return JSON.stringify(error);
	} catch {
		return 'Unknown error';
	}
}
