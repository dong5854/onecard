import React from 'react';
import styles from '@/components/GameObject/DamageCounter.module.css';

interface DamageCounterProps {
	value: number;
	label?: string;
	maxValue?: number;
	helperText?: string;
	className?: string;
	isActive?: boolean;
}

const DamageCounter: React.FC<DamageCounterProps> = ({
	value,
	label = 'Damage',
	maxValue,
	helperText,
	className,
	isActive,
}) => {
	const hasProgress = typeof maxValue === 'number' && maxValue > 0;
	const clampedValue = hasProgress
		? Math.max(0, Math.min(value, maxValue))
		: value;
	const progressPercent = hasProgress
		? Math.min(100, Math.max(0, (clampedValue / maxValue) * 100))
		: 0;

	const active = typeof isActive === 'boolean' ? isActive : value > 0;

	const containerClassName = [styles.damageCounter, className]
		.filter(Boolean)
		.join(' ');

	return (
		<section
			className={containerClassName}
			data-active={active ? 'true' : undefined}
			aria-live="polite"
			aria-label={`${label}: ${value}${hasProgress ? ` out of ${maxValue}` : ''}`}
		>
			<span className={styles.label}>{label}</span>
			<span className={styles.value}>{value}</span>
			{hasProgress && (
				<div
					className={styles.progress}
					role="progressbar"
					aria-valuemin={0}
					aria-valuemax={maxValue}
					aria-valuenow={clampedValue}
					aria-valuetext={`${clampedValue} of ${maxValue}`}
				>
					<div
						className={styles.progressFill}
						style={{ width: `${progressPercent}%` }}
					/>
				</div>
			)}
			{helperText && <span className={styles.helperText}>{helperText}</span>}
		</section>
	);
};

export default DamageCounter;
