import React from 'react';
import PixelRetroButton from './PixelRetroButton';
import styles from './GameOverPanel.module.css';

interface GameOverPanelProps {
	winnerName?: string | null;
	onRestart: () => void;
	roundsPlayed?: number;
	cardsDrawn?: number;
	className?: string;
	variant?: 'overlay' | 'inline';
}

const GameOverPanel: React.FC<GameOverPanelProps> = ({
	winnerName,
	onRestart,
	roundsPlayed,
	cardsDrawn,
	className,
	variant = 'overlay',
}) => {
	const hasStats =
		typeof roundsPlayed === 'number' || typeof cardsDrawn === 'number';

	const panel = (
		<div
			className={styles.panel}
			role={variant === 'overlay' ? 'dialog' : undefined}
			aria-modal={variant === 'overlay' ? 'true' : undefined}
			aria-label="Game over"
		>
			<div className={styles.title}>Game Over</div>
			<div className={styles.winner}>Winner: {winnerName ?? 'Unknown'}</div>
			{hasStats && (
				<div className={styles.stats}>
					{typeof roundsPlayed === 'number' && (
						<div className={styles.statCard}>
							<div className={styles.statLabel}>Rounds</div>
							<div className={styles.statValue}>{roundsPlayed}</div>
						</div>
					)}
					{typeof cardsDrawn === 'number' && (
						<div className={styles.statCard}>
							<div className={styles.statLabel}>Cards Drawn</div>
							<div className={styles.statValue}>{cardsDrawn}</div>
						</div>
					)}
				</div>
			)}
			<div className={styles.actions}>
				<PixelRetroButton text="Play Again" onClick={onRestart} />
			</div>
		</div>
	);

	if (variant === 'inline') {
		return (
			<div className={`${styles.inlineRoot} ${className ?? ''}`}>{panel}</div>
		);
	}

	return <div className={`${styles.overlay} ${className ?? ''}`}>{panel}</div>;
};

export default GameOverPanel;
