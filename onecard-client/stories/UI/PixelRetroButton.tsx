import React, { useState } from 'react';
import './PixelRetroButton.css';

interface PixelRetroButtonProps {
  text: string;
  onClick?: () => void;
}

const PixelRetroButton = ({ text, onClick }: PixelRetroButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonClass = isPressed ? 'pixel-button pressed' : 'pixel-button';

  return (
      <button
          className={buttonClass}
          onMouseDown={() => setIsPressed(true)}
          onMouseUp={() => setIsPressed(false)}
          onMouseLeave={() => setIsPressed(false)}
          onClick={onClick}
      >
        <div className="inner">
          <span className="button-text">{text}</span>
        </div>
      </button>
  );
};

export default PixelRetroButton;
