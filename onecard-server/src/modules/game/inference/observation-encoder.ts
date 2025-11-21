import type {
  GameSettings,
  GameState,
} from '@/modules/game/domain/types/gameState';
import type {
  PokerCardPropsWithId,
  SuitsValue,
} from '@/modules/game/domain/types/pokerCard';

const RANKS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
// Python 환경과 동일한 순서를 강제한다.
const SUITS: SuitsValue[] = ['clubs', 'diamonds', 'hearts', 'spades'];

export interface ObservationSpec {
  readonly ranks: number[];
  readonly suits: SuitsValue[];
  readonly maxHandSize: number;
  readonly playerCount: number;
  readonly initialDeckSize: number;
  readonly vectorSize: number;
}

const computeVectorSize = (
  spec: Omit<ObservationSpec, 'vectorSize'>,
): number => {
  const rankDim = spec.ranks.length;
  const suitDim = spec.suits.length;
  const playerDim = spec.playerCount;
  const opponentDim = Math.max(0, spec.playerCount - 1);
  return (
    rankDim + // hand rank counts
    suitDim + // hand suit counts
    1 + // hand joker count
    rankDim + // top card rank one-hot
    suitDim + // top card suit one-hot
    1 + // top card joker flag
    1 + // damage
    1 + // direction
    playerDim + // current player one-hot
    1 + // deck size
    opponentDim // opponent hand sizes
  );
};

export const buildObservationSpec = (
  settings: GameSettings,
): ObservationSpec => {
  const playerCount = settings.numberOfPlayers;
  const baseDeckSize = 52 + (settings.includeJokers ? 2 : 0);
  const initialDeckSize = Math.max(
    1,
    baseDeckSize - playerCount * settings.initHandSize - 1,
  );

  const specBase = {
    ranks: RANKS,
    suits: SUITS,
    maxHandSize: settings.maxHandSize,
    playerCount,
    initialDeckSize,
  } as const;

  return {
    ...specBase,
    vectorSize: computeVectorSize(specBase),
  };
};

const normalize = (value: number, max: number): number => {
  if (max <= 0) return 0;
  return value / max;
};

export const encodeObservation = (
  state: GameState,
  specOverride?: ObservationSpec,
): Float32Array => {
  const spec = specOverride ?? buildObservationSpec(state.settings);
  const hand = state.players[0]?.hand ?? [];

  const rankCounts: number[] = Array.from(
    { length: spec.ranks.length },
    () => 0,
  );
  const suitCounts: number[] = Array.from(
    { length: spec.suits.length },
    () => 0,
  );
  let jokerCount = 0;

  for (const card of hand) {
    if (card.isJoker) {
      jokerCount += 1;
      continue;
    }
    if (typeof card.rank === 'number') {
      const rankIdx = spec.ranks.indexOf(card.rank);
      if (rankIdx >= 0) rankCounts[rankIdx] += 1;
    }
    if (card.suit) {
      const suitIdx = spec.suits.indexOf(card.suit);
      if (suitIdx >= 0) suitCounts[suitIdx] += 1;
    }
  }

  const maxHand = Math.max(1, spec.maxHandSize);
  for (let i = 0; i < rankCounts.length; i++) {
    rankCounts[i] = normalize(rankCounts[i], maxHand);
  }
  for (let i = 0; i < suitCounts.length; i++) {
    suitCounts[i] = normalize(suitCounts[i], maxHand);
  }
  const jokerFeat = [normalize(jokerCount, maxHand)];

  const hasTopCard = state.discardPile.length > 0;
  const topCard: PokerCardPropsWithId | null = hasTopCard
    ? state.discardPile[0]
    : null;
  const topRank: number[] = Array.from({ length: spec.ranks.length }, () => 0);
  const topSuit: number[] = Array.from({ length: spec.suits.length }, () => 0);
  const topJoker = [hasTopCard && topCard?.isJoker ? 1 : 0];
  if (hasTopCard && topCard && !topCard.isJoker) {
    if (typeof topCard.rank === 'number') {
      const rankIdx = spec.ranks.indexOf(topCard.rank);
      if (rankIdx >= 0) topRank[rankIdx] = 1;
    }
    if (topCard.suit) {
      const suitIdx = spec.suits.indexOf(topCard.suit);
      if (suitIdx >= 0) topSuit[suitIdx] = 1;
    }
  }

  const damage = [
    normalize(Math.min(state.damage, spec.maxHandSize), spec.maxHandSize),
  ];
  const direction = [state.direction === 'clockwise' ? 1 : 0];

  const currentPlayer: number[] = Array.from(
    { length: spec.playerCount },
    () => 0,
  );
  if (
    state.currentPlayerIndex >= 0 &&
    state.currentPlayerIndex < spec.playerCount
  ) {
    currentPlayer[state.currentPlayerIndex] = 1;
  }

  const deckSize = [
    Math.min(
      normalize(state.deck.length, Math.max(1, spec.initialDeckSize)),
      1,
    ),
  ];

  const opponentSizes: number[] = state.players
    .slice(1)
    .map((player) => Math.min(normalize(player.hand.length, maxHand), 1));

  const vector: number[] = [
    ...rankCounts,
    ...suitCounts,
    ...jokerFeat,
    ...topRank,
    ...topSuit,
    ...topJoker,
    ...damage,
    ...direction,
    ...currentPlayer,
    ...deckSize,
    ...opponentSizes,
  ];

  if (vector.length !== spec.vectorSize) {
    throw new Error(
      `Observation length ${String(vector.length)} does not match spec ${String(spec.vectorSize)}`,
    );
  }

  return Float32Array.from(vector);
};

export const OBSERVATION_RANKS = RANKS;
export const OBSERVATION_SUITS = SUITS;
