import { GameSettings, GameState } from '@/types/gameState';
import { PokerCardPropsWithId } from '@/types/pokerCard';

export interface GameResource {
	id: string;
	state: GameState;
	createdAt: string;
	updatedAt: string;
}

export interface EngineStepResult {
	state: GameState;
	done: boolean;
	info?: Record<string, unknown>;
}

export type EffectCardPayload = Pick<
	PokerCardPropsWithId,
	'id' | 'isJoker' | 'isFlipped' | 'rank' | 'suit'
>;

export type GameActionType =
	| 'START_GAME'
	| 'PLAY_CARD'
	| 'DRAW_CARD'
	| 'NEXT_TURN'
	| 'APPLY_SPECIAL_EFFECT'
	| 'END_GAME';

export interface RemoteGameAction {
	type: GameActionType;
	playerIndex?: number;
	cardIndex?: number;
	amount?: number;
	effectCard?: EffectCardPayload;
	winnerIndex?: number;
}

export async function createGameSession(
	settings?: Partial<GameSettings>,
): Promise<GameResource> {
	const response = await fetch('/api/games', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ settings }),
		cache: 'no-store',
	});
	return handleResponse<GameResource>(response);
}

export async function applyGameAction(
	gameId: string,
	action: RemoteGameAction,
): Promise<EngineStepResult> {
	const response = await fetch(`/api/games/${gameId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ action }),
		cache: 'no-store',
	});
	return handleResponse<EngineStepResult>(response);
}

export async function executeAiTurn(gameId: string): Promise<EngineStepResult> {
	const response = await fetch(`/api/games/${gameId}/ai-turns`, {
		method: 'POST',
		cache: 'no-store',
	});
	return handleResponse<EngineStepResult>(response);
}

async function handleResponse<T>(response: Response): Promise<T> {
	if (!response.ok) {
		throw new Error(await extractErrorMessage(response));
	}
	if (response.status === 204) {
		return undefined as T;
	}
	return (await response.json()) as T;
}

async function extractErrorMessage(response: Response): Promise<string> {
	const fallback = `Request failed with status ${response.status}`;
	try {
		const data = await response.json();
		if (typeof data === 'string') {
			return data;
		}
		if (data?.message) {
			if (Array.isArray(data.message)) {
				return data.message.join(', ');
			}
			if (typeof data.message === 'string') {
				return data.message;
			}
		}
		return fallback;
	} catch {
		return fallback;
	}
}
