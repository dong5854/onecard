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
    const [imageLoaded, setImageLoaded] = useState(false);
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
        setImageLoaded(false);
        setImageError(false);

        const img = new Image();
        img.src = getCardImage();

        img.onload = () => {
            setImageLoaded(true);
            setImageError(false);
        };

        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            setImageLoaded(false);
            setImageError(true);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [rank, suit, isJoker, isFlipped]);

    const handleDragStart = (e : React.DragEvent<HTMLElement>) => {
        setIsDragging(true);
        const data = JSON.stringify({rank, suit, isJoker})
        e.dataTransfer.setData("text/plain", data)
        setDraggedData(data)
    }

    const onDragEnd = (e : React.DragEvent<HTMLElement>) => {
        setIsDragging(false);
        console.log("드래그 종료. 드래그된 데이터:", draggedData);
        setDraggedData("");
    }

    if (imageError) {
        return <FallBackCard isFlipped={isFlipped} rank={rank} suit={suit} isJoker={isJoker} onClick={onClick}/>;
    }

    if (!imageLoaded) {
        // TODO: 카드 이미지가 미처 로딩되지 않은 경우 ex) 네트워크 상태 나쁨
    }

    return (
        <img
            className={`poker-card-size ${isDragging ? 'dragging' : ''}`}
            src={getCardImage()}
            alt={isFlipped ? 'Card Back' : (isJoker ? 'Joker' : `${rank} of ${suit}`)}
            onClick={onClick}
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={onDragEnd}
        />
    );
};

export default PokerCard;