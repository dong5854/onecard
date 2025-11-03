'use client';

import { useSearchParams } from 'next/navigation';
import GameOverPanel from '@/components/UI/GameOverPanel';
import { useOneCardGame } from '@/lib/hooks/useOneCardGame';
import { useEffect } from 'react';
import { GameSettings, Mode } from '@/types/gameState';
import { AIDifficulty } from '@/types/gamePlayer';
import SinglePlayerBoard from '@/components/UI/board/SinglePlayerBoard';

export default function SinglePlayerPage() {
	const searchParams = useSearchParams();

	const mode = searchParams.get('mode') as Mode;
	const numberOfPlayers = parseInt(searchParams.get('players') || '0', 10);
	const includeJokers = searchParams.get('jokers') === 'true';
	const initHandSize = parseInt(searchParams.get('initHand') || '0', 10);
	const maxHandSize = parseInt(searchParams.get('maxHand') || '0', 10);
	const difficultyParam = searchParams.get('difficulty');
	const difficulty: AIDifficulty = ['easy', 'medium', 'hard'].includes(
		difficultyParam ?? '',
	)
		? (difficultyParam as AIDifficulty)
		: 'easy';

	const gameSettings: GameSettings = {
		mode: mode || 'single',
		numberOfPlayers: isNaN(numberOfPlayers) ? 2 : numberOfPlayers,
		includeJokers: includeJokers,
		initHandSize: isNaN(initHandSize) ? 5 : initHandSize,
		maxHandSize: isNaN(maxHandSize) ? 15 : maxHandSize,
		difficulty,
	};

	const { gameState, initializeGame, playCard, drawCard } =
		useOneCardGame(gameSettings);

	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	const openedCard = gameState.discardPile[0] ?? null;

	if (gameState.gameStatus == 'waiting') {
		return <div style={{ color: 'white' }}>Loading game...</div>;
	}

	if (gameState.gameStatus === 'finished') {
		return (
			<GameOverPanel
				winnerName={gameState.winner?.name ?? null}
				onRestart={initializeGame}
			/>
		);
	}

	return (
		<SinglePlayerBoard
			players={gameState.players}
			currentPlayerIndex={gameState.currentPlayerIndex}
			damage={gameState.damage}
			openedCard={openedCard}
			onDrawCard={drawCard}
			onPlayCard={playCard}
			selfIndex={0}
		/>
	);
}
