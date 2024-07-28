import React from 'react';
import styles from './GameTitle.module.css';

interface GameTitleProps {
    title: string,
    subtitle?: string
}

const GameTitle: React.FC<GameTitleProps> = ({title, subtitle}) => {
    return (
        <div className={styles.gameTitle}>
            <div className={styles.titleText}>{title}</div>
            {subtitle && <div className={styles.subtitleText}>{subtitle}</div>}
        </div>
    );
};

export default GameTitle;