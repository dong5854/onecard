import React, { ReactElement } from 'react';
import styles from '@/components/GameObject/OverlappingCards.module.css';

interface OverlappingCardsProps {
	children: ReactElement[];
	vertical?: boolean;
	spacing?: number;
}

export const OverlappingCards = ({
	children,
	vertical = false,
	spacing = 30,
}: OverlappingCardsProps) => {
	return (
		<div className={vertical ? styles.containerVertical : styles.container}>
			{React.Children.map(children, (child, index) => (
				<div
					className={vertical ? styles.cardWrapperVertical : styles.cardWrapper}
					style={
						vertical
							? {}
							: {
									zIndex: index,
								}
					}
				>
					{child}
				</div>
			))}
		</div>
	);
};

export default OverlappingCards;
