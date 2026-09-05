'use client';

import React from 'react';
import { CardItem, DifficultyId } from '../types/game';
import { DIFFICULTIES } from '../lib/themes';
import { Card } from './Card';

interface GameBoardProps {
  cards: CardItem[];
  difficulty: DifficultyId;
  onCardClick: (card: CardItem) => void;
  mismatchedCardIds: string[];
}

export const GameBoard: React.FC<GameBoardProps> = ({
  cards,
  difficulty,
  onCardClick,
  mismatchedCardIds,
}) => {
  const config = DIFFICULTIES[difficulty];

  // Dynamic Tailwind grid column styles
  const gridColClass =
    config.cols === 4
      ? 'grid-cols-4'
      : config.cols === 6
      ? 'grid-cols-4 sm:grid-cols-6'
      : 'grid-cols-4';

  return (
    <div className="w-full max-w-5xl mx-auto flex items-center justify-center p-2">
      <div className={`grid ${gridColClass} gap-3 sm:gap-4 w-full max-w-4xl`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={onCardClick}
            isMismatched={mismatchedCardIds.includes(card.id)}
          />
        ))}
      </div>
    </div>
  );
};
