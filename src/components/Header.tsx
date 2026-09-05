'use client';

import React from 'react';

interface HeaderProps {
  isMuted: boolean;
  onToggleSound: () => void;
  bestScore: number | null;
  bestTime: number | null;
}

export const Header: React.FC<HeaderProps> = ({
  isMuted,
  onToggleSound,
  bestScore,
  bestTime,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel shadow-2xl mb-6 border border-white/10">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-2xl shadow-lg shadow-purple-500/30 animate-pulse">
          🧠
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
            Jogo da Memória
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Desafie seu cérebro, encontre os pares e supere recordes!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {bestScore !== null && (
          <div className="px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-500/30 text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
            <span>🏆 Recorde:</span>
            <span className="text-amber-400 font-bold">{bestScore} pts</span>
            {bestTime !== null && (
              <span className="text-slate-400 font-normal">
                ({Math.floor(bestTime / 60)}m {bestTime % 60}s)
              </span>
            )}
          </div>
        )}

        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-white/10 text-lg transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
          title={isMuted ? 'Ativar Som' : 'Desativar Som'}
          aria-label={isMuted ? 'Ativar Som' : 'Desativar Som'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
};
