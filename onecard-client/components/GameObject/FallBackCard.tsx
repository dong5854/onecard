import React, {forwardRef, memo} from 'react';
import { suits, ranks, colors, isValidRank, isValidSuit, PokerCardProps } from '../../types/gameTypes';
import styles from './Pokercard.module.css';

interface FallBackCardProps extends PokerCardProps {
    onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const FallBackCard = memo(forwardRef<HTMLDivElement, FallBackCardProps>(({
            rank,
            suit,
            isJoker,
            isFlipped,
            onClick,
            draggable,
            onMouseDown,
        }, ref) => {

    const baseClassName = `${styles.pokerCard} ${styles.pokerCardSize}`
    if (isFlipped) {
        return (
            <div ref={ref} className={`${baseClassName} ${styles.pokerCardBack} ${draggable ? styles.pointerCardCursor : ''}`} onClick={onClick} onMouseDown={onMouseDown}>
                <div className={styles.cardBackDesign}>
                    <div className={styles.cardBackPattern}/>
                    <div className={styles.cardBackLogo}>♠♥♣♦</div>
                </div>
            </div>
        );
    }

    if (isJoker) {
        return (
            <div ref={ref} className={`${baseClassName} ${draggable ? styles.pointerCardCursor : ''}`} onClick={onClick} onMouseDown={onMouseDown}>
                <div className={styles.joker}>joker</div>
                <div className={styles.suit}>🤡</div>
            </div>
        );
    }

    const cardColor = suit && isValidSuit(suit) ? colors[suit] : 'black';
    const displayRank = isValidRank(rank) ? ranks[rank] : 'error';
    const displaySuit = isValidSuit(suit) ? suits[suit] : 'error';

    return (
        <div ref={ref} className={`${baseClassName} ${draggable ? styles.pointerCardCursor : ''}`} style={{ color: cardColor}} onClick={onClick} onMouseDown={onMouseDown}>
            <div className={styles.rank}>{displayRank}</div>
            <div className={styles.suit}>{displaySuit}</div>
        </div>
    );
}));

FallBackCard.displayName = 'FallBackCard';

export default FallBackCard;