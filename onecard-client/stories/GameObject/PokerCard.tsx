'use client'

import React, {useEffect, useState} from "react";
import './pockercard.css';

const suits = {
  clubs: '♣',
  hearts: '♥',
  diamonds: '♦',
  spades: '♠',
} as const;

const ranks = {
  1: 'A', 2: '2', 3: '3', 4: '4', 5: '5',
  6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K'
} as const;

const colors = {
  spades: 'black',
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
} as const;

type RankValue = keyof typeof ranks;
type SuitsValue = keyof typeof suits;


const isValidRank = (rank: any): rank is RankValue => {
  return rank in ranks;
}

const isValidSuit = (suit: any): suit is SuitsValue => {
  return suit in suits;
}

type PokerCardProps = {
  isJoker: boolean;
  isFlipped: boolean;
  rank?: RankValue;
  suit?: SuitsValue;
  onClick?: () => void;
}

const FallBackCard = ({
                        rank,
                        suit,
                        isJoker,
                        isFlipped,
                        onClick,
                      }: PokerCardProps) => {
  if (isFlipped) {
      return (
          <div className="poker-card poker-card-size poker-card-back" onClick={onClick}>
              <div className="card-back-design">
                  <div className="card-back-pattern"></div>
                  <div className="card-back-logo">♠♥♣♦</div>
              </div>
          </div>
      );
  }


  if (isJoker) {
    return (
        <div className="poker-card poker-card-size" onClick={onClick}>
          <div className="joker">joker</div>
          <div className="suit">🤡</div>
        </div>
    );
  }

  return (
      <div className="poker-card poker-card-size" style={{ color: suit ? colors[suit] : 'black' }} onClick={onClick}>
        <div className="rank">{isValidRank(rank) ? ranks[rank] : 'error'}</div>
        <div className="suit">{isValidSuit(suit) ? suits[suit] : 'error'}</div>
      </div>
  );
};

export const PokerCard = ({
                            rank,
                            suit,
                            isJoker,
                            isFlipped,
                            onClick,
                          }: PokerCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
  }, [rank, suit, isJoker, isFlipped]);

  const getCardImage = () => {
    if (isFlipped) {
      return '/cards/backs/back_4.png'
    }
    if (isJoker) {
      return `/cards/Joker.png`;
    }
    return `/cards/${suit}/${suit}_card_${rank}.png`;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  }

  const handleImageError = () => {
    setImageLoaded(false);
  };

  return (
      <>
        <img
            className="poker-card-size"
            style={{ display: imageLoaded ? 'block' : 'none' }}
            src={getCardImage()}
            alt={isFlipped ? 'Card Back' : (isJoker ? 'Joker' : `${rank} of ${suit}`)}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onClick={onClick}
        />
        {!imageLoaded && <FallBackCard isFlipped={isFlipped} rank={rank} suit={suit} isJoker={isJoker} onClick={onClick}/>}
      </>
  );
};

export default PokerCard;