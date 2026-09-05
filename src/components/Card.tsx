'use client';

import React, { memo } from 'react';
import { CardItem } from '../types/game';

interface CardProps {
  card: CardItem;
  onClick: (card: CardItem) => void;
  isMismatched?: boolean;
}

export const Card: React.FC<CardProps> = memo(({ card, onClick, isMismatched }) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!card.isFlipped && !card.isMatched) {
        onClick(card);
      }
    }
  };

  return (
    <div
      role="button"
      tabIndex={card.isMatched || card.isFlipped ? -1 : 0}
      aria-label={
        card.isFlipped || card.isMatched
          ? `Carta ${card.name}`
          : 'Carta virada para baixo'
      }
      onClick={() => {
        if (!card.isFlipped && !card.isMatched) {
          onClick(card);
        }
      }}
      onKeyDown={handleKeyDown}
      className={`relative w-full aspect-square cursor-pointer perspective-1000 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-slate-950 rounded-2xl select-none group ${
        card.isMatched ? 'cursor-default pointer-events-none' : ''
      }`}
    >
      <div
        className={`w-full h-full duration-500 transform-style-3d transition-transform relative rounded-2xl ${
          card.isFlipped || card.isMatched ? 'rotate-y-180' : ''
        } ${isMismatched ? 'animate-shake' : ''} ${
          card.isMatched ? 'animate-match' : ''
        }`}
      >
        {/* VERSO DA CARTA (Face Down) */}
        <div className="absolute inset-0 w-full h-full rounded-2xl backface-hidden glass-card-back flex items-center justify-center p-2 group-hover:border-purple-400/50 transition-colors shadow-lg">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900/60 border border-white/5 flex items-center justify-center relative overflow-hidden">
            {/* Pattern / Logo Icon */}
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-300 text-sm font-black group-hover:scale-110 transition-transform">
              ✨
            </div>
            {card.isHighlighted && (
              <div className="absolute inset-0 bg-amber-400/30 animate-pulse rounded-xl" />
            )}
          </div>
        </div>

        {/* FRENTE DA CARTA (Face Up) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-2xl backface-hidden rotate-y-180 glass-card-front flex flex-col items-center justify-center p-2 shadow-xl ${
            card.isMatched
              ? 'border-emerald-400/60 bg-emerald-950/40 shadow-emerald-500/20'
              : 'border-indigo-400/40'
          }`}
        >
          <div
            className={`w-full h-full rounded-xl bg-gradient-to-tr ${card.color} bg-opacity-20 flex flex-col items-center justify-center gap-1 p-1`}
          >
            <span className="text-3xl sm:text-4xl md:text-5xl filter drop-shadow-md transform transition-transform group-hover:scale-110">
              {card.emoji}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-200 tracking-tight text-center truncate max-w-full px-1">
              {card.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

Card.displayName = 'Card';
