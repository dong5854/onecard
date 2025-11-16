import type { GameSettings } from '@/modules/game/domain/types/gameState';

export const GAME_DEFAULT_SETTINGS = Symbol('GAME_DEFAULT_SETTINGS');

export const DEFAULT_GAME_SETTINGS: GameSettings = {
  mode: 'single',
  numberOfPlayers: 2,
  includeJokers: false,
  initHandSize: 5,
  maxHandSize: 15,
  difficulty: 'easy',
};
