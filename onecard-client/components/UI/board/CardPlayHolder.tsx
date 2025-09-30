import React, { CSSProperties, ReactNode } from 'react';
import styles from './CardPlayHolder.module.css';

interface CardPlayHolderProps {
	width?: CSSProperties['width'];
	height?: CSSProperties['height'];
	children?: ReactNode;
	className?: string;
	isActive?: boolean;
	label?: string;
}

export const CardPlayHolder = ({
	width = '260px',
	height = '180px',
	children,
	className,
	isActive,
	label,
}: CardPlayHolderProps) => {
	const containerClassName = [styles.container, className]
		.filter(Boolean)
		.join(' ');

	return (
		<section
			className={containerClassName}
			style={{ width, height }}
			data-active={isActive ? 'true' : undefined}
			aria-label={label ?? undefined}
			role="group"
		>
			{label && <span className={styles.label}>{label}</span>}
			<div className={styles.surface}>{children}</div>
		</section>
	);
};

export default CardPlayHolder;
