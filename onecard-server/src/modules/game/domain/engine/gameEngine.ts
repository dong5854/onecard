import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import type { GameAction } from '@/modules/game/domain/types/gameAction';
import {
  createGameState,
  initializeGameState,
  startGame,
} from '@/modules/game/domain/state/createGameState';
import { transitionGameState } from '@/modules/game/domain/state/game-state.machine';
import type { PokerCardPropsWithId } from '@/modules/game/domain/types/pokerCard';

export interface EngineStepResult {
  state: GameState;
  done: boolean;
  info?: Record<string, unknown>;
}

export const createInitialState = (settings: GameSettings): GameState =>
  createGameState(settings);

export const createStartedState = (settings: GameSettings): GameState =>
  startGame(initializeGameState(settings));

export const step = (
  state: GameState,
  action: GameAction,
): EngineStepResult => {
  const nextState = transitionGameState(state, action);
  const done = nextState.gameStatus === 'finished';
  return { state: nextState, done, info: { action } };
};

export const applyActions = (
  state: GameState,
  actions: GameAction[],
): EngineStepResult =>
  actions.reduce<EngineStepResult>(
    (acc, action) => {
      if (acc.done) {
        return acc;
      }
      return step(acc.state, action);
    },
    { state, done: false },
  );

export const startGameAction = (): GameAction => ({ type: 'START_GAME' });

export const playCardAction = (
  playerIndex: number,
  cardIndex: number,
): GameAction => ({
  type: 'PLAY_CARD',
  payload: { playerIndex, cardIndex },
});

export const drawCardAction = (amount: number): GameAction => ({
  type: 'DRAW_CARD',
  payload: { amount },
});

export const nextTurnAction = (): GameAction => ({ type: 'NEXT_TURN' });

export const applySpecialEffectAction = (
  effectCard: PokerCardPropsWithId,
): GameAction => ({
  type: 'APPLY_SPECIAL_EFFECT',
  payload: { effectCard },
});

export const endGameAction = (winnerIndex: number): GameAction => ({
  type: 'END_GAME',
  payload: { winnerIndex },
});
