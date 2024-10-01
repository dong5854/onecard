import { GameState } from '@/types/gameState';
import {
	attackValue,
	changeDirection,
	turnSpecialEffect,
} from '@/lib/utils/cardUtils';
import { PokerCardProps } from '@/types/pokerCard';

export const applySpecialEffectStatus = (
	state: GameState,
	effectCard: PokerCardProps,
): GameState => {
	return {
		...state,
		currentPlayerIndex: turnSpecialEffect(effectCard, state),
		direction: changeDirection(effectCard, state.direction),
		damage: state.damage + attackValue(effectCard),
	};
};
