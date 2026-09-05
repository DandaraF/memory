'use client';

import React, { memo } from 'react';
import { Card } from './Card';
import { CardItem } from '../types/game';

interface GameBoardProps {
  cards: CardItem[];
  onCardClick: (card: CardItem) => void;
  mismatchedCardIds: string[];
}

export const GameBoard: React.FC<GameBoardProps> = memo(({ cards, onCardClick, mismatchedCardIds }) => {
  // Determine grid columns based on card count
  const getGridCols = () => {
    const len = cards.length;
    if (len === 12) return 'grid-cols-3 sm:grid-cols-4'; // Fácil
    if (len === 16) return 'grid-cols-4'; // Médio
    if (len === 24) return 'grid-cols-4 sm:grid-cols-6'; // Difícil
    if (len === 30) return 'grid-cols-5 sm:grid-cols-6'; // Expert
    return 'grid-cols-4';
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-6">
      <div className={`grid gap-3 sm:gap-4 ${getGridCols()}`}>
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => onCardClick(card)}
            isMismatched={mismatchedCardIds.includes(card.id)}
          />
        ))}
      </div>
    </div>
  );
});

GameBoard.displayName = 'GameBoard';
