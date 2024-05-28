import React from "react";
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

type RankValue = typeof ranks[keyof typeof ranks];
type SuitsValue = keyof typeof suits;

interface PockerCardProps {
  rank?: RankValue;
  suit?: SuitsValue;
  isJoker: boolean;
  onClick?: () => void;
}

export const PockerCard = ({
  rank,
  suit,
  isJoker,
  onClick,
  ...props
}: PockerCardProps) => {
  if (isJoker) {
    return (
      <div className="poker-card" onClick={onClick} {...props}>
        <div className="rank">🤡</div>
        <div className="joker">Joker</div>
      </div>
    );
  }

  return (
    <div className="poker-card" style={{ color: suit ? colors[suit] : 'black' }} onClick={onClick} {...props}>
      <div className="rank">{rank}</div>
      <div className="suit">{suit ? suits[suit] : ''}</div>
    </div>
  );
}

PockerCard.defaultProps = {
  isJoker: false,
};

export default PockerCard;