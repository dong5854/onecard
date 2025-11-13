import React, { forwardRef, memo } from 'react';
import {
	suits,
	ranks,
	colors,
	isValidRank,
	isValidSuit,
	PokerCardProps,
} from '@/types/pokerCard';
import styles from '@/components/GameObject/Pokercard.module.css';

interface FallBackCardProps extends PokerCardProps {
	onMouseDown?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const FallBackCard = memo(
	forwardRef<HTMLDivElement, FallBackCardProps>(
		(
			{ rank, suit, isJoker, isFlipped, onClick, draggable, onMouseDown },
			ref,
		) => {
			const containerClassName = [
				styles.cardContainer,
				draggable ? styles.pointerCardCursor : '',
			]
				.filter(Boolean)
				.join(' ');

			if (isFlipped) {
				return (
					<div
						ref={ref}
						className={`${containerClassName} ${styles.cardGlow}`}
						onClick={onClick}
						onMouseDown={onMouseDown}
					>
						<div className={`${styles.cardSurface} ${styles.cardBackSurface}`}>
							<div className={styles.cardBackPattern} />
							<div className={styles.cardBackIcon}>♠♥♣♦</div>
						</div>
					</div>
				);
			}

			if (isJoker) {
				return (
					<div
						ref={ref}
						className={containerClassName}
						onClick={onClick}
						onMouseDown={onMouseDown}
					>
						<div className={styles.cardSurface}>
							<div className={`${styles.cardContent} ${styles.jokerContent}`}>
								<div className={styles.jokerBadge}>JOKER</div>
								<div className={styles.jokerIcon}>🤡</div>
								<div className={styles.jokerBadge}>JOKER</div>
							</div>
						</div>
					</div>
				);
			}

			const cardColor = suit && isValidSuit(suit) ? colors[suit] : '#1e2c20';
			const displayRank = isValidRank(rank) ? ranks[rank] : 'ERR';
			const displaySuit = isValidSuit(suit) ? suits[suit] : 'ERR';

			return (
				<div
					ref={ref}
					className={containerClassName}
					onClick={onClick}
					onMouseDown={onMouseDown}
				>
					<div className={styles.cardSurface}>
						<div className={styles.cardContent} style={{ color: cardColor }}>
							<div className={`${styles.corner} ${styles.cornerTop}`}>
								<span className={styles.cornerRank}>{displayRank}</span>
								<span className={styles.cornerSuit}>{displaySuit}</span>
							</div>
							<div className={`${styles.corner} ${styles.cornerBottom}`}>
								<span className={styles.cornerRank}>{displayRank}</span>
								<span className={styles.cornerSuit}>{displaySuit}</span>
							</div>
							<div className={styles.centerSuit}>{displaySuit}</div>
						</div>
					</div>
				</div>
			);
		},
	),
);

FallBackCard.displayName = 'FallBackCard';

export default FallBackCard;
