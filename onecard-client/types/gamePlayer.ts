import { PokerCardProps, PokerCardPropsWithId } from '@/types/pokerCard';

export interface Player {
	readonly id: string;
	readonly name: string;
	readonly hand: PokerCardPropsWithId[];
	readonly isSelf: boolean;
	readonly isAI: boolean;
}

export interface AIPlayer extends Player {
	readonly difficulty: AIDifficulty; // 난이도 추가
}

export type AIDifficulty = 'easy' | 'medium' | 'hard';
