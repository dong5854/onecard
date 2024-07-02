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

    useEffect(() => {
        setImageLoaded(false);
    }, [rank, suit, isJoker, isFlipped]);

    const getCardImage = () => {
        if (isFlipped) {
            return '/cards/backs/back_4.png'
        }
        if (isJoker) {
            return `/cards/Joker.png`;
        }
        return `/cards/${suit}/${suit}_card_${rank}.png`;
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    }

    const handleImageError = () => {
        setImageLoaded(false);
    };

    return (
        <>
            <img
                className="poker-card-size"
                style={{ display: imageLoaded ? 'block' : 'none' }}
                src={getCardImage()}
                alt={isFlipped ? 'Card Back' : (isJoker ? 'Joker' : `${rank} of ${suit}`)}
                onLoad={handleImageLoad}
                onError={handleImageError}
                onClick={onClick}
            />
            {!imageLoaded && <FallBackCard isFlipped={isFlipped} rank={rank} suit={suit} isJoker={isJoker} onClick={onClick}/>}
        </>
    );
};

export default PokerCard;