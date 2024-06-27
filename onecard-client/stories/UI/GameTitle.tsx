import React from 'react';
import './GameTitle.css';

interface GameTitleProps {
    title : string,
    subtitle?: string
}
const GameTitle = ({title, subtitle} : GameTitleProps) => {
    return (
        <div className="game-title">
            <div className="title-text">{title}</div>
            {subtitle && <div className="subtitle-text">{subtitle}</div> }
        </div>
    );
};

export default GameTitle;