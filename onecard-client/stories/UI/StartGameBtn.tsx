import React from "react";
import './startgamebutton.css';

interface StartGameButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const StartGameButton = ({
  label, onClick, disabled = false
}: StartGameButtonProps) => {
  return (
    <button className="start-game-button" onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}