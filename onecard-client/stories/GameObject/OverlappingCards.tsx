import React, { ReactElement } from 'react';
import styles from './OverlappingCards.module.css';

interface OverlappingCardsProps {
    children: ReactElement[];
    spacing?: number;
}

export const OverlappingCards = ({ children, spacing = 30 } : OverlappingCardsProps) => {
    return (
        <div className={styles.container}>
            {React.Children.map(children, (child, index) => (
                <div
                    className={styles.cardWrapper}
                    style={{
                        left: `${index * spacing}px`,
                        zIndex: index
                    }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
};

export default OverlappingCards;