import {
  AIDifficulty,
  AIPlayer,
  Player,
} from '@/modules/game/domain/types/gamePlayer';
import {
  PokerCardProps,
  PokerCardPropsWithId,
} from '@/modules/game/domain/types/pokerCard';
import { isValidPlay } from '@/modules/game/domain/utils/cardUtils';

export function createMyself(
  id: string,
  name: string,
  hand: PokerCardPropsWithId[],
): Player {
  return {
    id,
    name,
    hand,
    isSelf: true,
    isAI: false,
  };
}

export function createAIPlayer(
  id: string,
  name: string,
  hand: PokerCardPropsWithId[],
  difficulty: AIDifficulty,
): AIPlayer {
  return {
    id,
    name,
    hand,
    isSelf: false,
    isAI: true,
    difficulty,
  };
}

export function cardToPlay(
  hand: PokerCardPropsWithId[],
  topCard: PokerCardProps,
  damage: number,
  difficulty: AIDifficulty,
): PokerCardPropsWithId {
  switch (difficulty) {
    case 'easy':
      return hand.find((card) => isValidPlay(card, topCard, damage))!;
    case 'medium':
      // TODO: 중간 난이도 로직 추가
      return hand.find((card) => isValidPlay(card, topCard, damage))!;
    case 'hard':
      // TODO: 어려움 난이도 로직 추가
      return hand.find((card) => isValidPlay(card, topCard, damage))!;
    default:
      throw new Error('Invalid difficulty');
  }
}
