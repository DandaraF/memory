'use client';

import React from 'react';
import { DIFFICULTIES, THEMES } from '../lib/themes';
import { DifficultyId, ThemeId } from '../types/game';

interface ControlsProps {
  difficulty: DifficultyId;
  theme: ThemeId;
  onSelectDifficulty: (diff: DifficultyId) => void;
  onSelectTheme: (theme: ThemeId) => void;
  onNewGame: () => void;
  onGiveHint: () => void;
  isHintDisabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({
  difficulty,
  theme,
  onSelectDifficulty,
  onSelectTheme,
  onNewGame,
  onGiveHint,
  isHintDisabled,
}) => {
  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl glass-panel mb-6 border border-white/10">
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
        {/* Dificuldade */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10">
          {(Object.keys(DIFFICULTIES) as DifficultyId[]).map((dKey) => {
            const d = DIFFICULTIES[dKey];
            const isActive = difficulty === dKey;
            return (
              <button
                key={dKey}
                onClick={() => onSelectDifficulty(dKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {d.name.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Tema */}
        <div className="flex items-center gap-1.5 bg-slate-900/60 p-1 rounded-xl border border-white/10">
          {(Object.keys(THEMES) as ThemeId[]).map((tKey) => {
            const t = THEMES[tKey];
            const isActive = theme === tKey;
            return (
              <button
                key={tKey}
                onClick={() => onSelectTheme(tKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
                title={t.name}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline">{t.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
        {/* Dica */}
        <button
          onClick={onGiveHint}
          disabled={isHintDisabled}
          className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed transform active:scale-95"
          title="Revela temporariamente um par não encontrado (-30 pts)"
        >
          💡 Dica
        </button>

        {/* Novo Jogo */}
        <button
          onClick={onNewGame}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 transition-all transform active:scale-95"
        >
          🔄 Novo Jogo
        </button>
      </div>
    </div>
  );
};
