"use client"

import React, { useState } from 'react';
import styles from './PixelRetroButton.module.css';

interface PixelRetroButtonProps {
  text: string;
  className?: string;
  onClick?: () => void;
}

const PixelRetroButton: React.FC<PixelRetroButtonProps> = ({ text, className, onClick }) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonClass = `${styles.pixelButton} ${isPressed ? styles.pressed : ''} ${className || ''}`;

  return (
      <button
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