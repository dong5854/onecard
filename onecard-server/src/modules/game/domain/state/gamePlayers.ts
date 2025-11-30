import type {
  AIDifficulty,
  AIPlayer,
  Player,
} from '@/modules/game/domain/types/gamePlayer';
import type {
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

export function findPlayableCardBruteForce(
  hand: PokerCardPropsWithId[],
  topCard: PokerCardProps,
  damage: number,
): PokerCardPropsWithId | null {
  const playableCard = hand.find((card) => isValidPlay(card, topCard, damage));
  if (!playableCard) {
    return null;
  }

  return playableCard;
}
