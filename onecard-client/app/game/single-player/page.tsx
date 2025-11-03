'use client';

import { useSearchParams } from 'next/navigation';
import PokerCard from '@/components/GameObject/PokerCard';
import CardPlayHolder from '@/components/UI/board/CardPlayHolder';
import OverlappingCards from '@/components/GameObject/OverlappingCards';
import DamageCounter from '@/components/GameObject/DamageCounter';
import GameOverPanel from '@/components/UI/GameOverPanel';
import PlayerBadge from '@/components/UI/PlayerBadge';
import { useOneCardGame } from '@/lib/hooks/useOneCardGame';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from './SinglePlayerPage.module.css';
import { isValidPlay } from '@/lib/utils/cardUtils';
import { GameSettings, Mode } from '@/types/gameState';
import { Player } from '@/types/gamePlayer';

type OpponentPosition = 'top' | 'left' | 'right';
type SlotPosition = OpponentPosition | 'bottom';

interface PlayerAssignment {
	player: Player;
	index: number;
}

const opponentLayouts: Record<number, OpponentPosition[]> = {
	0: [],
	1: ['top'],
	2: ['left', 'right'],
	3: ['left', 'top', 'right'],
};

const defaultOpponentLayout: OpponentPosition[] = ['left', 'top', 'right'];

const slotDescriptors: Record<
	SlotPosition,
	{
		wrapperClassName: string;
		badgeClassName: string;
		vertical: boolean;
	}
> = {
	top: {
		wrapperClassName:
			'relative z-10 flex items-center justify-center col-span-5 row-span-2',
		badgeClassName: 'absolute top-3 left-5',
		vertical: false,
	},
	left: {
		wrapperClassName:
			'relative z-10 flex items-center justify-center row-span-5 col-span-2',
		badgeClassName: 'absolute top-3 left-5',
		vertical: true,
	},
	right: {
		wrapperClassName:
			'relative z-10 flex items-center justify-center row-span-5 col-span-2',
		badgeClassName: 'absolute top-3 left-5',
		vertical: true,
	},
	bottom: {
		wrapperClassName:
			'relative z-10 flex items-center justify-center col-span-5 row-span-2',
		badgeClassName: 'absolute top-3 left-5',
		vertical: false,
	},
};

export default function SinglePlayerPage() {
	const searchParams = useSearchParams();

	const mode = searchParams.get('mode') as Mode;
	const numberOfPlayers = parseInt(searchParams.get('players') || '0', 10);
	const includeJokers = searchParams.get('jokers') === 'true';
	const initHandSize = parseInt(searchParams.get('initHand') || '0', 10);
	const maxHandSize = parseInt(searchParams.get('maxHand') || '0', 10);

	const gameSettings: GameSettings = {
		mode: mode || 'single',
		numberOfPlayers: isNaN(numberOfPlayers) ? 2 : numberOfPlayers,
		includeJokers: includeJokers,
		initHandSize: isNaN(initHandSize) ? 5 : initHandSize,
		maxHandSize: isNaN(maxHandSize) ? 15 : maxHandSize,
	};

	console.log(gameSettings);

	const { gameState, initializeGame, playCard, drawCard, getCurrentPlayer } =
		useOneCardGame(gameSettings);

	const [draggingCard, setDraggingCard] = useState<number | null>(null);
	const [isOverDropZone, setIsOverDropZone] = useState(false);
	const dropZoneRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		initializeGame();
	}, [initializeGame]);

	const openedCard = gameState.discardPile[0];
	const currentPlayer = getCurrentPlayer();
	const isMyTurn = useCallback(() => {
		return gameState.currentPlayerIndex === 0;
	}, [gameState.currentPlayerIndex]);

	const opponentsWithIndex = useMemo<PlayerAssignment[]>(() => {
		return gameState.players
			.map((player, index) => ({ player, index }))
			.filter(({ index }) => index !== 0);
	}, [gameState.players]);

	const assignedOpponents = useMemo<
		Record<OpponentPosition, PlayerAssignment | undefined>
	>(() => {
		const layout =
			opponentLayouts[opponentsWithIndex.length] ?? defaultOpponentLayout;
		const map: Record<OpponentPosition, PlayerAssignment | undefined> = {
			top: undefined,
			left: undefined,
			right: undefined,
		};
		layout.forEach((position, idx) => {
			const assignment = opponentsWithIndex[idx];
			if (assignment) {
				map[position] = assignment;
			}
		});
		return map;
	}, [opponentsWithIndex]);

	const selfAssignment: PlayerAssignment | undefined = gameState.players[0]
		? { player: gameState.players[0], index: 0 }
		: undefined;

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

	const handleCardDragStart = (index: number) => {
		setDraggingCard(index);
	};

	const handleCardDrag = (clientX: number, clientY: number) => {
		if (!isMyTurn() || draggingCard === null || !dropZoneRef.current) return;
		const draggedCard = currentPlayer.hand[draggingCard];
		if (!draggedCard || !openedCard) return;
		const rect = dropZoneRef.current.getBoundingClientRect();
		setIsOverDropZone(
			isValidPlay(draggedCard, openedCard, gameState.damage) &&
				clientX >= rect.left &&
				clientX <= rect.right &&
				clientY >= rect.top &&
				clientY <= rect.bottom,
		);
	};

	const handleCardDragEnd = () => {
		if (draggingCard !== null && isMyTurn() && isOverDropZone) {
			playCard(gameState.currentPlayerIndex, draggingCard);
		}
		setDraggingCard(null);
		setIsOverDropZone(false);
	};

	const renderPlayerSlot = (
		position: SlotPosition,
		assignment?: PlayerAssignment,
	) => {
		const descriptor = slotDescriptors[position];
		const isSelf = position === 'bottom';
		return (
			<div className={descriptor.wrapperClassName}>
				{assignment ? (
					<>
						<div className={descriptor.badgeClassName}>
							<PlayerBadge
								name={assignment.player.name}
								isActive={gameState.currentPlayerIndex === assignment.index}
							/>
						</div>
						<OverlappingCards vertical={descriptor.vertical}>
							{assignment.player.hand.map((card, cardIndex) => (
								<PokerCard
									key={card.id}
									rank={card.rank}
									isJoker={card.isJoker}
									isFlipped={isSelf ? false : (card.isFlipped ?? true)}
									draggable={isSelf}
									suit={card.suit}
									onDragStart={
										isSelf ? () => handleCardDragStart(cardIndex) : undefined
									}
									onDrag={isSelf ? handleCardDrag : undefined}
									onDragEnd={isSelf ? handleCardDragEnd : undefined}
								/>
							))}
						</OverlappingCards>
					</>
				) : null}
			</div>
		);
	};

	return (
		<div className="w-full h-full flex items-center justify-center">
			<div className="aspect-square w-full max-w-[150vh] max-h-[85vh] grid grid-cols-9 grid-rows-9 gap-0.5">
				<div className="flex items-center justify-center col-span-2 row-span-2" />
				{renderPlayerSlot('top', assignedOpponents.top)}
				<div className="flex items-center justify-center col-span-2 row-span-2" />
				{renderPlayerSlot('left', assignedOpponents.left)}
				<div className="flex items-center justify-center text-xs col-span-5" />
				{renderPlayerSlot('right', assignedOpponents.right)}
				<div className="flex items-center justify-center text-xs row-span-3" />
				<div className="relative z-0 flex items-center justify-center text-xs col-span-3 row-span-3">
					<div
						ref={dropZoneRef}
						className={`relative ${isOverDropZone ? styles.dropZoneGlow : ''}`}
					>
						<CardPlayHolder
							width="260px"
							height="180px"
							isActive={isOverDropZone}
							label="Play Zone"
						>
							<PokerCard
								key="deck-top"
								isJoker={false}
								isFlipped={true}
								draggable={false}
								onClick={drawCard}
							/>
							{openedCard && (
								<PokerCard
									key={openedCard.id}
									isJoker={openedCard.isJoker}
									isFlipped={false}
									suit={openedCard.suit}
									rank={openedCard.rank}
									draggable={false}
								/>
							)}
						</CardPlayHolder>
					</div>
				</div>
				<div className="flex items-center justify-center row-span-3">
					<DamageCounter value={gameState.damage} />
				</div>
				<div className="flex items-center justify-center text-xs col-span-5" />
				<div className="flex items-center justify-center col-span-2 row-span-2" />
				{renderPlayerSlot('bottom', selfAssignment)}
				<div className="flex items-center justify-center col-span-2 row-span-2" />
			</div>
		</div>
	);
}
