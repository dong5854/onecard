'use client';

import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import FallBackCard from './FallBackCard';
import { PokerCardProps } from '@/types/pokerCard';
import styles from './Pokercard.module.css';

const PokerCard = memo(
	({
		rank,
		suit,
		isJoker,
		isFlipped,
		onClick,
		draggable = true,
		onDragStart,
		onDrag,
		onDragEnd,
	}: PokerCardProps) => {
		const [imageError, setImageError] = useState(false);
		const isDraggingRef = useRef(false);
		const dragOffsetRef = useRef({ x: 0, y: 0 });
		const cardRef = useRef<HTMLDivElement>(null);
		const initialPositionRef = useRef({ x: 0, y: 0 });

		const getCardImage = useCallback(() => {
			if (isFlipped) return '/cards/backs/back_4.png';
			if (isJoker) return `/cards/Joker.png`;
			return `/cards/${suit}/${suit}_card_${rank}.png`;
		}, [isFlipped, isJoker, suit, rank]);

		useEffect(() => {
			const img = new Image();
			img.src = getCardImage();
			img.onload = () => setImageError(false);
			img.onerror = () => {
				console.error(`Failed to load image: ${img.src}`);
				setImageError(true);
			};
		}, [getCardImage]);

		const handleDragStart = useCallback(
			(e: React.MouseEvent<HTMLElement>) => {
				if (!draggable || !cardRef.current) return;

				const rect = cardRef.current.getBoundingClientRect();
				initialPositionRef.current = { x: rect.left, y: rect.top };
				dragOffsetRef.current = {
					x: e.clientX - rect.left,
					y: e.clientY - rect.top,
				};
				cardRef.current.style.transition = 'none';
				isDraggingRef.current = true;
				onDragStart && onDragStart();
			},
			[draggable, onDragStart],
		);

		const handleDrag = useCallback(
			(e: MouseEvent) => {
				if (!isDraggingRef.current || !cardRef.current) return;

				const newX =
					e.clientX - initialPositionRef.current.x - dragOffsetRef.current.x;
				const newY =
					e.clientY - initialPositionRef.current.y - dragOffsetRef.current.y;

				cardRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
				onDrag && onDrag(e.clientX, e.clientY);
			},
			[onDrag],
		);

		const handleDragEnd = useCallback(() => {
			if (!cardRef.current) return;

			isDraggingRef.current = false;
			cardRef.current.style.transition = 'transform 0.3s ease';
			cardRef.current.style.transform = 'translate(0, 0)';
			onDragEnd && onDragEnd();
		}, [onDragEnd]);

		useEffect(() => {
			if (!draggable) return;

			const handleMouseMove = (e: MouseEvent) =>
				isDraggingRef.current && handleDrag(e);
			const handleMouseUp = () => isDraggingRef.current && handleDragEnd();

			window.addEventListener('mousemove', handleMouseMove);
			window.addEventListener('mouseup', handleMouseUp);

			return () => {
				window.removeEventListener('mousemove', handleMouseMove);
				window.removeEventListener('mouseup', handleMouseUp);
			};
		}, [draggable, handleDrag, handleDragEnd]);

		if (imageError) {
			return (
				<FallBackCard
					ref={cardRef}
					isFlipped={isFlipped}
					rank={rank}
					suit={suit}
					isJoker={isJoker}
					onClick={onClick}
					onMouseDown={handleDragStart}
				/>
			);
		}

		return (
			<div
				ref={cardRef}
				className={`${styles.pokerCardSize} ${draggable ? styles.pointerCardCursor : ''}`}
				style={{
					backgroundImage: `url(${getCardImage()})`,
					backgroundSize: 'contain',
					backgroundPosition: 'center',
					backgroundRepeat: 'no-repeat',
					position: 'relative',
				}}
				onClick={onClick}
				onMouseDown={handleDragStart}
				role="img"
				aria-label={
					isFlipped ? 'Card Back' : isJoker ? 'Joker' : `${rank} of ${suit}`
				}
			/>
		);
	},
);

PokerCard.displayName = 'PokerCard';

export default PokerCard;
