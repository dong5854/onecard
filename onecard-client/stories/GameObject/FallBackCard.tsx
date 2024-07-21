import React from 'react';
import { suits, ranks, colors, isValidRank, isValidSuit, PokerCardProps } from './types';
import styles from './Pokercard.module.css';

export const FallBackCard = ({
            rank,
            suit,
            isJoker,
            isFlipped,
            onClick,
        } : PokerCardProps) => {
    if (isFlipped) {
        return (
            <div className={`${styles.pokerCard} ${styles.pokerCardSize} ${styles.pokerCardBack}`} onClick={onClick}>
                <div className={styles.cardBackDesign}>
                    <div className={styles.cardBackPattern}></div>
                    <div className={styles.cardBackLogo}>♠♥♣♦</div>
                </div>
            </div>
        );
    }

    if (isJoker) {
        return (
            <div className={`${styles.pokerCard} ${styles.pokerCardSize}`} onClick={onClick}>
                <div className={styles.joker}>joker</div>
                <div className={styles.suit}>🤡</div>
            </div>
        );
    }

    return (
        <div className={`${styles.pokerCard} ${styles.pokerCardSize}`} style={{ color: suit ? colors[suit] : 'black' }} onClick={onClick}>
            <div className={styles.rank}>{isValidRank(rank) ? ranks[rank] : 'error'}</div>
            <div className={styles.suit}>{isValidSuit(suit) ? suits[suit] : 'error'}</div>
        </div>
    );
};

export default FallBackCard;