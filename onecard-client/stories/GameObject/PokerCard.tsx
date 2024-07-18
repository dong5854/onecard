'use client'

import React, {useCallback, useEffect, useRef, useState} from "react";
import FallBackCard from './FallBackCard';
import { PokerCardProps } from './types';
import './Pokercard.css';

export const PokerCard = ({
        rank,
        suit,
        isJoker,
        isFlipped,
        onClick,
    } : PokerCardProps) => {
    const [imageError, setImageError] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({x: 0, y: 0});
    const cardRef = useRef<HTMLDivElement>(null);
    const initialPosition = useRef({x: 0, y: 0});

    const getCardImage = useCallback(() => {
        if (isFlipped) return '/cards/backs/back_4.png';
        if (isJoker) return `/cards/Joker.png`;
        return `/cards/${suit}/${suit}_card_${rank}.png`;
    }, [isFlipped, isJoker, suit, rank]);

    useEffect(() => {
        const img = new Image();
        img.src = getCardImage();

        const handleImageLoad = () => setImageError(false);
        const handleImageError = () => {
            console.error(`Failed to load image: ${img.src}`);
            setImageError(true);
        };

        img.addEventListener('load', handleImageLoad);
        img.addEventListener('error', handleImageError);

        return () => {
            img.removeEventListener('load', handleImageLoad);
            img.removeEventListener('error', handleImageError);
        };
    }, [getCardImage]);

    const handleDragStart = (e: React.MouseEvent<HTMLElement>) => {
        // Set drag data
        const data = JSON.stringify({rank, suit, isJoker});

        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            initialPosition.current = {x: rect.left, y: rect.top};
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
        setIsDragging(true);
    }

    const handleDrag = (e: React.MouseEvent<HTMLElement>) => {
        if (e.clientX === 0 && e.clientY === 0) return; // Ignore invalid drag events

        const newX = e.clientX - initialPosition.current.x - dragOffset.x;
        const newY = e.clientY - initialPosition.current.y - dragOffset.y;

        if (cardRef.current) {
            cardRef.current.style.transform = `translate(${newX}px, ${newY}px)`;
        }
    }

    const handleDragEnd = () => {
        setIsDragging(false);
        if (cardRef.current) {
            cardRef.current.style.transform = 'none';
        }
    }

    if (imageError) {
        return <FallBackCard isFlipped={isFlipped} rank={rank} suit={suit} isJoker={isJoker} onClick={onClick}/>;
    }

    return (
        <div
            ref={cardRef}
            className={`poker-card-size ${isDragging ? 'dragging' : ''}`}
            style={{
                backgroundImage: `url(${getCardImage()})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                position: 'relative',
                zIndex: isDragging ? 1000 : 'auto',
                transition: isDragging ? 'none' : 'transform 0.3s ease',

            }}
            onClick={onClick}
            draggable={false}
            onMouseDown={handleDragStart}
            onMouseMove={isDragging ? handleDrag : undefined}
            onMouseUp={handleDragEnd}
            role="img"
            aria-label={isFlipped ? 'Card Back' : (isJoker ? 'Joker' : `${rank} of ${suit}`)}
        />
    );
};

export default PokerCard;