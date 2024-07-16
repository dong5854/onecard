'use client'

import React, { useEffect, useState } from "react";
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
    const [draggedData, setDraggedData] = useState("");

    const getCardImage = () => {
        if (isFlipped) {
            return '/cards/backs/back_4.png'
        }
        if (isJoker) {
            return `/cards/Joker.png`;
        }
        return `/cards/${suit}/${suit}_card_${rank}.png`;
    };

    useEffect(() => {
        setImageError(false);

        const img = new Image();
        img.src = getCardImage();

        img.onload = () => {
            setImageError(false);
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            setImageError(true);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [rank, suit, isJoker, isFlipped]);

    const handleDragStart = (e : React.DragEvent<HTMLElement>) => {
        setIsDragging(true);

        const img = new Image()
        img.src = getCardImage()
        img.style.opacity = '1';

        const data = JSON.stringify({rank, suit, isJoker})
        e.dataTransfer.setData("text/plain", data)
        setDraggedData(data)
    }

    const handleDragEnd = (e : React.DragEvent<HTMLElement>) => {
        setIsDragging(false);
        console.log("드래그 종료. 드래그된 데이터:", draggedData);
        setDraggedData("");
    }

    if (imageError) {
        return <FallBackCard isFlipped={isFlipped} rank={rank} suit={suit} isJoker={isJoker} onClick={onClick}/>;
    }

    return (
        <div
            className={`poker-card-size ${isDragging ? 'dragging' : ''}`}
            style={{
                backgroundImage: `url(${getCardImage()})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
            onClick={onClick}
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            role="img"
            aria-label={isFlipped ? 'Card Back' : (isJoker ? 'Joker' : `${rank} of ${suit}`)}
        />
    );
};

export default PokerCard;