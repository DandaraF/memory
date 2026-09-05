'use client';

import React from 'react';
import { formatTime } from '../lib/gameLogic';

interface StatsBarProps {
  moves: number;
  matches: number;
  totalPairs: number;
  score: number;
  combo: number;
  elapsedSeconds: number;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  moves,
  matches,
  totalPairs,
  score,
  combo,
  elapsedSeconds,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {/* Tempo */}
      <div className="glass-panel rounded-xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-lg">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          ⏱️ Tempo
        </span>
        <span className="text-2xl font-black text-cyan-300 tracking-tight font-mono">
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      {/* Jogadas */}
      <div className="glass-panel rounded-xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-lg">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          🎯 Jogadas
        </span>
        <span className="text-2xl font-black text-indigo-300 tracking-tight">
          {moves}
        </span>
      </div>

      {/* Pares Encontrados */}
      <div className="glass-panel rounded-xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-lg">
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          🧩 Pares
        </span>
        <span className="text-2xl font-black text-emerald-400 tracking-tight">
          {matches} / {totalPairs}
        </span>
      </div>

      {/* Pontuação & Combo */}
      <div className="glass-panel rounded-xl p-3 flex flex-col items-center justify-center border border-white/10 shadow-lg relative overflow-hidden">
        {combo > 1 && (
          <span className="absolute top-1 right-2 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-500 to-red-500 text-white animate-bounce shadow-md">
            🔥 {combo}x Combo!
          </span>
        )}
        <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
          ⭐ Pontuação
        </span>
        <span className="text-2xl font-black text-amber-300 tracking-tight">
          {score}
        </span>
      </div>
    </div>
  );
};
