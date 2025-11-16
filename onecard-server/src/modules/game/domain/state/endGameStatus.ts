import type { GameState } from '@/modules/game/domain/types/gameState';

export const endGameStatus = (
  state: GameState,
  action: { type: 'END_GAME'; payload: { winnerIndex: number } },
): GameState => {
  return {
    ...state,
    gameStatus: 'finished',
    winner: state.players[action.payload.winnerIndex],
  };
};
