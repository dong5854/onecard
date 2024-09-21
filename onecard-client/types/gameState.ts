import { Player } from './gamePlayer';
import { PokerCardPropsWithId } from './pokerCard';

// 게임 상태 및 설정 관련 정의
export type Direction = 'clockwise' | 'counterclockwise';
export type Mode = 'single' | 'multi';
export type GameStatus = 'waiting' | 'playing' | 'finished';

export interface GameSettings {
	mode: Mode;
	numberOfPlayers: number;
	includeJokers: boolean;
	initHandSize: number;
	maxHandSize: number;
}

export interface GameState {
	players: Player[];
	currentPlayerIndex: number;
	deck: PokerCardPropsWithId[];
	discardPile: PokerCardPropsWithId[];
	direction: Direction;
	damage: number;
	gameStatus: GameStatus;
	settings: GameSettings;
	winner?: Player;
}
