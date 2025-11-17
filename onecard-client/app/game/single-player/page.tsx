'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import GameOverPanel from '@/components/UI/GameOverPanel';
import { useOneCardGame } from '@/lib/hooks/useOneCardGame';
import { GameSettings, Mode } from '@/types/gameState';
import { AIDifficulty } from '@/types/gamePlayer';
import SinglePlayerBoard from '@/components/UI/board/SinglePlayerBoard';

export default function SinglePlayerPage() {
	const searchParams = useSearchParams();

	const modeParam = searchParams.get('mode') as Mode | null;
	const playersParam = searchParams.get('players');
	const jokersParam = searchParams.get('jokers');
	const initHandParam = searchParams.get('initHand');
	const maxHandParam = searchParams.get('maxHand');
	const difficultyParam = searchParams.get('difficulty');

	const gameSettings: GameSettings = useMemo(() => {
		const parsedPlayers = parseInt(playersParam || '0', 10);
		const parsedInitHand = parseInt(initHandParam || '0', 10);
		const parsedMaxHand = parseInt(maxHandParam || '0', 10);
		const includeJokers = jokersParam === 'true';
		const difficulty: AIDifficulty = ['easy', 'medium', 'hard'].includes(
			difficultyParam ?? '',
		)
			? (difficultyParam as AIDifficulty)
			: 'easy';

		return {
			mode: modeParam ?? 'single',
			numberOfPlayers: Number.isNaN(parsedPlayers) ? 2 : parsedPlayers,
			includeJokers,
			initHandSize: Number.isNaN(parsedInitHand) ? 5 : parsedInitHand,
			maxHandSize: Number.isNaN(parsedMaxHand) ? 15 : parsedMaxHand,
			difficulty,
		};
	}, [
		difficultyParam,
		initHandParam,
		jokersParam,
		maxHandParam,
		modeParam,
		playersParam,
	]);

	const {
		gameState,
		initializeGame,
		playCard,
		drawCard,
		isLoading,
		error,
		activeAiPlayerIndex,
		aiPlayIndicator,
	} = useOneCardGame(gameSettings);

	useEffect(() => {
		void initializeGame();
	}, [initializeGame]);

	const handlePlayCard = useCallback(
		(playerIndex: number, cardIndex: number) => {
			void playCard(playerIndex, cardIndex);
		},
		[playCard],
	);

	const handleDrawCard = useCallback(() => {
		void drawCard();
	}, [drawCard]);

	const handleRestart = useCallback(() => {
		void initializeGame();
	}, [initializeGame]);

	const openedCard = gameState?.discardPile[0] ?? null;

	if (!gameState || gameState.gameStatus === 'waiting' || isLoading) {
		return (
			<div className="flex flex-col items-center justify-center h-full text-white gap-4">
				<p>{error ?? 'Loading game...'}</p>
				{error && (
					<button
						className="px-4 py-2 bg-blue-700 hover:bg-blue-600 rounded"
						onClick={handleRestart}
						type="button"
					>
						Try Again
					</button>
				)}
			</div>
		);
	}

	if (gameState.gameStatus === 'finished') {
		return (
			<GameOverPanel
				winnerName={gameState.winner?.name ?? null}
				onRestart={handleRestart}
			/>
		);
	}

	return (
		<>
			{error && (
				<div className="absolute top-4 left-1/2 -translate-x-1/2 text-sm text-red-300">
					{error}
				</div>
			)}
			<SinglePlayerBoard
				players={gameState.players}
				currentPlayerIndex={activeAiPlayerIndex ?? gameState.currentPlayerIndex}
				damage={gameState.damage}
				openedCard={openedCard}
				onDrawCard={handleDrawCard}
				onPlayCard={handlePlayCard}
				selfIndex={0}
				aiPlayIndicator={aiPlayIndicator}
			/>
		</>
	);
}
