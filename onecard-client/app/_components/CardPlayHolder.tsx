import React, {ReactNode} from 'react';
import styles from './CardPlayHolder.module.css';

interface CardPlayHolderProps {
    width?: string;
    height?: string;
    children?: ReactNode;
}

export const CardPlayHolder = ({ width = '200px', height = '100px', children } : CardPlayHolderProps) => {
    return (
        <div
            className={styles.container}
            style={{
                width: width,
                height: height,
            }}
        >
        {children}
        </div>
    );
};

export default CardPlayHolder;