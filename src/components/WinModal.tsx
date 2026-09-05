'use client';

import React from 'react';
import { formatTime, calculateStarRating } from '../lib/gameLogic';

interface WinModalProps {
  isOpen: boolean;
  moves: number;
  score: number;
  elapsedSeconds: number;
  totalPairs: number;
  maxCombo: number;
  isNewBestScore: boolean;
  onPlayAgain: () => void;
}

export const WinModal: React.FC<WinModalProps> = ({
  isOpen,
  moves,
  score,
  elapsedSeconds,
  totalPairs,
  maxCombo,
  isNewBestScore,
  onPlayAgain,
}) => {
  if (!isOpen) return null;

  const stars = calculateStarRating(moves, totalPairs);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-white/20 shadow-2xl text-center overflow-hidden">
        {/* Glow backdrop decorative effect */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-indigo-500/30 rounded-full blur-3xl" />

        {/* Celebration Trophy */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-orange-500 flex items-center justify-center text-4xl shadow-xl shadow-amber-500/30 animate-bounce">
          🏆
        </div>

        <h2 className="text-3xl font-black tracking-tight text-white mb-1">
          Parabéns! Você Venceu!
        </h2>
        <p className="text-xs text-slate-300 mb-4 font-medium">
          Sua memória e concentração deram show!
        </p>

        {/* Avaliação por Estrelas */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((starIndex) => (
            <span
              key={starIndex}
              className={`text-3xl transition-all transform ${
                starIndex <= stars
                  ? 'text-amber-400 scale-110 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]'
                  : 'text-slate-600 scale-90'
              }`}
            >
              ★
            </span>
          ))}
        </div>

        {/* Recorde badge */}
        {isNewBestScore && (
          <div className="mb-4 py-1.5 px-4 rounded-full bg-gradient-to-r from-amber-500 to-red-500 text-white text-xs font-extrabold tracking-wider uppercase shadow-lg shadow-red-500/30 animate-pulse inline-block">
            🎉 NOVO RECORDE PESSOAL! 🎉
          </div>
        )}

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-slate-900/70 p-4 rounded-2xl border border-white/10 text-left">
          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Tempo Total</div>
            <div className="text-lg font-extrabold text-cyan-300 font-mono">
              {formatTime(elapsedSeconds)}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Jogadas</div>
            <div className="text-lg font-extrabold text-indigo-300">
              {moves}
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Maior Combo</div>
            <div className="text-lg font-extrabold text-amber-400">
              🔥 {maxCombo}x
            </div>
          </div>

          <div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase">Pontuação Final</div>
            <div className="text-lg font-extrabold text-emerald-400">
              {score} pts
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <button
          onClick={onPlayAgain}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-black text-sm shadow-xl shadow-purple-500/30 transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          🎮 Jogar Novamente
        </button>
      </div>
    </div>
  );
};
