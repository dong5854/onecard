import React from 'react';
import { suits, ranks, colors, isValidRank, isValidSuit, PokerCardProps } from './types';
import './Pokercard.css';

export const FallBackCard = ({
            rank,
            suit,
            isJoker,
            isFlipped,
            onClick,
        } : PokerCardProps) => {
    if (isFlipped) {
        return (
            <div className="poker-card poker-card-size poker-card-back" onClick={onClick}>
                <div className="card-back-design">
                    <div className="card-back-pattern"></div>
                    <div className="card-back-logo">♠♥♣♦</div>
                </div>
            </div>
        );
    }

    if (isJoker) {
        return (
            <div className="poker-card poker-card-size" onClick={onClick}>
                <div className="joker">joker</div>
                <div className="suit">🤡</div>
            </div>
        );
    }

    return (
        <div className="poker-card poker-card-size" style={{ color: suit ? colors[suit] : 'black' }} onClick={onClick}>
            <div className="rank">{isValidRank(rank) ? ranks[rank] : 'error'}</div>
            <div className="suit">{isValidSuit(suit) ? suits[suit] : 'error'}</div>
        </div>
    );
};

export default FallBackCard;