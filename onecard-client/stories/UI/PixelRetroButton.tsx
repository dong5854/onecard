import React, { useState } from 'react';
import './PixelRetroButton.css';
import {className} from "postcss-selector-parser";

interface PixelRetroButtonProps {
  text: string;
  className: string;
  onClick?: () => void;
}

const PixelRetroButton = ({ text, className, onClick }: PixelRetroButtonProps) => {
  const [isPressed, setIsPressed] = useState(false);
  const buttonClass = isPressed ? 'pixel-button pressed' : 'pixel-button';

  return (
      <button
          className={`${buttonClass} ${className}`}
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
