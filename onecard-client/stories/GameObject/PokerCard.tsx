'use client'

import React, { useCallback, useEffect, useRef, useState, memo } from "react";
import FallBackCard from './FallBackCard';
import { PokerCardProps } from './types';
import './Pokercard.css';

const PokerCard= memo(({
          rank,
          suit,
          isJoker,
          isFlipped,
          onClick,
      } : PokerCardProps) => {
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

    const handleDragStart = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            initialPositionRef.current = { x: rect.left, y: rect.top };
            dragOffsetRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        isDraggingRef.current = true;
        cardRef.current?.classList.add('dragging');
    }, []);

    const handleDrag = useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (e.clientX === 0 && e.clientY === 0 || !isDraggingRef.current) return;

        const newX = e.clientX - initialPositionRef.current.x - dragOffsetRef.current.x;
        const newY = e.clientY - initialPositionRef.current.y - dragOffsetRef.current.y;

        if (cardRef.current) {
            cardRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    }, []);

    const handleDragEnd = useCallback(() => {
        isDraggingRef.current = false;
        if (cardRef.current) {
            cardRef.current.style.transform = 'none';
            cardRef.current.classList.remove('dragging');
        }
    }, []);

    if (imageError) {
        return <FallBackCard isFlipped={isFlipped} rank={rank} suit={suit} isJoker={isJoker} onClick={onClick}/>;
    }

    return (
        <div
            ref={cardRef}
            className="poker-hand poker-card-size"
            style={{
                backgroundImage: `url(${getCardImage()})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
            }}
            onClick={onClick}
            onMouseDown={handleDragStart}
            onMouseMove={handleDrag}
            onMouseUp={handleDragEnd}
            onMouseLeave={handleDragEnd}
            role="img"
            aria-label={isFlipped ? 'Card Back' : (isJoker ? 'Joker' : `${rank} of ${suit}`)}
        />
    );
});

PokerCard.displayName = 'PokerCard';

export default PokerCard;