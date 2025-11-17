'use client';

import React, { useState } from 'react';
import styles from '@/components/UI/PixelRetroButton.module.css';

interface PixelRetroButtonProps {
	text: string;
	className?: string;
	onClick?: () => void;
	type?: 'button' | 'submit' | 'reset';
	disabled?: boolean;
}

const PixelRetroButton: React.FC<PixelRetroButtonProps> = ({
	text,
	className,
	onClick,
	type = 'button',
	disabled = false,
}) => {
	const [isPressed, setIsPressed] = useState(false);
	const buttonClass = `${styles.pixelButton} ${isPressed ? styles.pressed : ''} ${className || ''}`;

	return (
		<button
			type={type}
			disabled={disabled}
			className={buttonClass}
			onMouseDown={() => setIsPressed(true)}
			onMouseUp={() => setIsPressed(false)}
			onMouseLeave={() => setIsPressed(false)}
			onClick={onClick}
		>
			<div className={styles.inner}>
				<span className={styles.buttonText}>{text}</span>
			</div>
		</button>
	);
};

export default PixelRetroButton;
