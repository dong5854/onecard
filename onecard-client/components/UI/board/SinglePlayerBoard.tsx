'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import OverlappingCards from '@/components/GameObject/OverlappingCards';
import PlayerBadge from '@/components/UI/PlayerBadge';
import CardPlayHolder from '@/components/UI/board/CardPlayHolder';
import PokerCard from '@/components/GameObject/PokerCard';
import DamageCounter from '@/components/GameObject/DamageCounter';
import { Player } from '@/types/gamePlayer';
import { PokerCardPropsWithId } from '@/types/pokerCard';
import { isValidPlay } from '@/lib/utils/cardUtils';
import styles from '@/components/UI/board/SinglePlayerBoard.module.css';

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

interface SinglePlayerBoardProps {
	players: Player[];
	currentPlayerIndex: number;
	damage: number;
	openedCard?: PokerCardPropsWithId | null;
	onDrawCard: () => void;
	onPlayCard: (playerIndex: number, cardIndex: number) => void;
	selfIndex?: number;
	aiPlayIndicator?: {
		playerName: string | null;
		sequence: number;
	} | null;
}

export function SinglePlayerBoard({
	players,
	currentPlayerIndex,
	damage,
	openedCard,
	onDrawCard,
	onPlayCard,
	selfIndex = 0,
	aiPlayIndicator,
}: SinglePlayerBoardProps) {
	const [draggingCard, setDraggingCard] = useState<number | null>(null);
	const [isOverDropZone, setIsOverDropZone] = useState(false);
	const dropZoneRef = useRef<HTMLDivElement>(null);
	const [showAiPlayFlash, setShowAiPlayFlash] = useState(false);
	const [aiPlayPlayerName, setAiPlayPlayerName] = useState<string | null>(null);

	useEffect(() => {
		if (!aiPlayIndicator) {
			return;
		}
		setAiPlayPlayerName(aiPlayIndicator.playerName ?? 'AI');
		setShowAiPlayFlash(true);
		const timeout = setTimeout(() => {
			setShowAiPlayFlash(false);
		}, 1000);
		return () => clearTimeout(timeout);
	}, [aiPlayIndicator?.sequence]);

	const opponentsWithIndex = useMemo<PlayerAssignment[]>(() => {
		return players
			.map((player, index) => ({ player, index }))
			.filter(({ index }) => index !== selfIndex);
	}, [players, selfIndex]);

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

	const isMyTurn = currentPlayerIndex === selfIndex;
	const selfPlayer = players[selfIndex];

	const handleCardDragStart = useCallback((index: number) => {
		setDraggingCard(index);
	}, []);

	const handleCardDrag = useCallback(
		(clientX: number, clientY: number) => {
			if (!isMyTurn || draggingCard === null || !dropZoneRef.current) return;
			const draggedCard = selfPlayer?.hand[draggingCard];
			if (!draggedCard || !openedCard) return;
			const rect = dropZoneRef.current.getBoundingClientRect();
			setIsOverDropZone(
				isValidPlay(draggedCard, openedCard, damage) &&
					clientX >= rect.left &&
					clientX <= rect.right &&
					clientY >= rect.top &&
					clientY <= rect.bottom,
			);
		},
		[damage, draggingCard, isMyTurn, openedCard, selfPlayer],
	);

	const handleCardDragEnd = useCallback(() => {
		if (draggingCard !== null && isMyTurn && isOverDropZone) {
			onPlayCard(selfIndex, draggingCard);
		}
		setDraggingCard(null);
		setIsOverDropZone(false);
	}, [draggingCard, isMyTurn, isOverDropZone, onPlayCard, selfIndex]);

	const handleDeckClick = useCallback(() => {
		if (isMyTurn) {
			onDrawCard();
		}
	}, [isMyTurn, onDrawCard]);

	const renderPlayerSlot = (
		position: SlotPosition,
		assignment?: PlayerAssignment,
	) => {
		const descriptor = slotDescriptors[position];
		const isSelfSlot = assignment?.index === selfIndex;

		return (
			<div className={descriptor.wrapperClassName}>
				{assignment ? (
					<>
						<div
							className={descriptor.badgeClassName}
							style={{
								zIndex: 20,
								transform: descriptor.vertical
									? undefined
									: 'translateY(-50px)',
							}}
						>
							<PlayerBadge
								name={assignment.player.name}
								isActive={currentPlayerIndex === assignment.index}
							/>
						</div>
						<div
							className={descriptor.vertical ? 'mt-16 ml-[6.5rem]' : undefined}
						>
							<OverlappingCards vertical={descriptor.vertical}>
								{assignment.player.hand.map((card, cardIndex) => (
									<PokerCard
										key={card.id}
										rank={card.rank}
										isJoker={card.isJoker}
										isFlipped={isSelfSlot ? false : (card.isFlipped ?? true)}
										draggable={isSelfSlot}
										suit={card.suit}
										onDragStart={
											isSelfSlot
												? () => handleCardDragStart(cardIndex)
												: undefined
										}
										onDrag={isSelfSlot ? handleCardDrag : undefined}
										onDragEnd={isSelfSlot ? handleCardDragEnd : undefined}
									/>
								))}
							</OverlappingCards>
						</div>
					</>
				) : null}
			</div>
		);
	};

	const topSlot = assignedOpponents.top;
	const leftSlot = assignedOpponents.left;
	const rightSlot = assignedOpponents.right;
	const bottomSlot = players[selfIndex]
		? ({ player: players[selfIndex], index: selfIndex } as PlayerAssignment)
		: undefined;

	return (
		<div className="w-full h-full flex items-center justify-center">
			<div className="aspect-square w-full max-w-[150vh] max-h-[85vh] grid grid-cols-9 grid-rows-9 gap-0.5">
				<div className="flex items-center justify-center col-span-2 row-span-2" />
				{renderPlayerSlot('top', topSlot)}
				<div className="flex items-center justify-center col-span-2 row-span-2" />
				{renderPlayerSlot('left', leftSlot)}
				<div className="flex items-center justify-center text-xs col-span-5" />
				{renderPlayerSlot('right', rightSlot)}
				<div className="flex items-center justify-center text-xs row-span-3" />
				<div className="relative z-0 flex items-center justify-center text-xs col-span-3 row-span-3">
					<div
						ref={dropZoneRef}
						className={`relative ${
							isOverDropZone ? styles.dropZoneGlow : ''
						} ${showAiPlayFlash ? styles.aiPlayFlash : ''}`}
					>
						{showAiPlayFlash && (
							<div className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-yellow-200 animate-pulse tracking-wide pointer-events-none select-none">
								{`${aiPlayPlayerName ?? 'AI'} played`}
							</div>
						)}
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
								onClick={handleDeckClick}
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
					<DamageCounter value={damage} />
				</div>
				<div className="flex items-center justify-center text-xs col-span-5" />
				<div className="flex items-center justify-center col-span-2 row-span-2" />
				{renderPlayerSlot('bottom', bottomSlot)}
				<div className="flex items-center justify-center col-span-2 row-span-2" />
			</div>
		</div>
	);
}

export default SinglePlayerBoard;
