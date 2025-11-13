import React from 'react';
import styles from '@/components/UI/PlayerBadge.module.css';

interface PlayerBadgeProps {
	name: string;
	isActive?: boolean;
	className?: string;
}

const PlayerBadge: React.FC<PlayerBadgeProps> = ({
	name,
	isActive = false,
	className,
}) => {
	const containerClassName = [
		styles.badge,
		isActive ? styles.active : '',
		className ?? '',
	]
		.filter(Boolean)
		.join(' ');

	return (
		<div className={containerClassName} role="status" aria-live="polite">
			<span className={styles.indicator} aria-hidden />
			<span className={styles.name}>{name}</span>
		</div>
	);
};

export default PlayerBadge;
