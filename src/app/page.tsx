'use client';

import React, {
  useReducer,
  useCallback,
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import { Header } from '../components/Header';
import { StatsBar } from '../components/StatsBar';
import { Controls } from '../components/Controls';
import { GameBoard } from '../components/GameBoard';
import { WinModal } from '../components/WinModal';
import { CardItem, DifficultyId, GameStatus, ThemeId } from '../types/game';
import { DIFFICULTIES } from '../lib/themes';
import { generateDeck, calculateMatchScore } from '../lib/gameLogic';
import { soundFx } from '../lib/audio';

// ─── Storage helpers ──────────────────────────────────────────────────────────

function loadBest(difficulty: DifficultyId) {
  if (typeof window === 'undefined') return { score: null as number | null, time: null as number | null };
  const s = localStorage.getItem(`memory_best_score_${difficulty}`);
  const t = localStorage.getItem(`memory_best_time_${difficulty}`);
  return { score: s ? parseInt(s, 10) : null, time: t ? parseInt(t, 10) : null };
}

function saveBest(difficulty: DifficultyId, score: number, time: number) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`memory_best_score_${difficulty}`, score.toString());
  localStorage.setItem(`memory_best_time_${difficulty}`, time.toString());
}

// ─── State & Reducer ──────────────────────────────────────────────────────────

interface GameState {
  difficulty: DifficultyId;
  theme: ThemeId;
  cards: CardItem[];
  flippedCards: CardItem[];
  mismatchedCardIds: string[];
  isProcessing: boolean;
  gameStatus: GameStatus;
  moves: number;
  matches: number;
  score: number;
  combo: number;
  maxCombo: number;
  elapsedSeconds: number;
  isMuted: boolean;
  bestScore: number | null;
  bestTime: number | null;
  isNewBestScore: boolean;
}

type GameAction =
  | { type: 'NEW_GAME'; difficulty: DifficultyId; theme: ThemeId }
  | { type: 'START_PLAYING' }
  | { type: 'FLIP_CARD'; card: CardItem }
  | { type: 'MATCH'; symbolId: string; points: number; newCombo: number }
  | { type: 'MISMATCH'; cardIds: [string, string] }
  | { type: 'UNFLIP'; cardIds: [string, string] }
  | { type: 'WIN'; finalScore: number; elapsed: number }
  | { type: 'TICK' }
  | { type: 'TOGGLE_MUTE' }
  | { type: 'HINT_ON'; cardIds: string[] }
  | { type: 'HINT_OFF'; cardIds: string[] }
  | { type: 'HINT_PENALTY' }
  | { type: 'SET_BEST'; score: number | null; time: number | null }
  | { type: 'NEW_BEST'; score: number; time: number };

function buildNewGameState(
  difficulty: DifficultyId,
  theme: ThemeId,
  prev?: Partial<GameState>
): Partial<GameState> {
  const deck = generateDeck(difficulty, theme);
  return {
    difficulty,
    theme,
    cards: deck.map((c) => ({ ...c, isFlipped: true })),
    flippedCards: [],
    mismatchedCardIds: [],
    isProcessing: true,
    gameStatus: 'idle' as GameStatus,
    moves: 0,
    matches: 0,
    score: 0,
    combo: 0,
    maxCombo: 0,
    elapsedSeconds: 0,
    isNewBestScore: false,
    bestScore: prev?.bestScore ?? null,
    bestTime: prev?.bestTime ?? null,
  };
}

function createInitialState(): GameState {
  return {
    isMuted: false,
    ...buildNewGameState('medium', 'space'),
  } as GameState;
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'NEW_GAME':
      return { ...state, ...buildNewGameState(action.difficulty, action.theme, state) };

    case 'START_PLAYING':
      return {
        ...state,
        cards: state.cards.map((c) => ({ ...c, isFlipped: false })),
        isProcessing: false,
        gameStatus: 'playing',
      };

    case 'FLIP_CARD':
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.card.id ? { ...c, isFlipped: true } : c
        ),
        flippedCards: [...state.flippedCards, action.card],
        isProcessing: state.flippedCards.length === 1,
      };

    case 'MATCH': {
      const newMatches = state.matches + 1;
      const totalPairs = DIFFICULTIES[state.difficulty].pairs;
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.symbolId === action.symbolId ? { ...c, isMatched: true } : c
        ),
        flippedCards: [],
        isProcessing: false,
        matches: newMatches,
        combo: action.newCombo,
        maxCombo: Math.max(state.maxCombo, action.newCombo),
        score: state.score + action.points,
        gameStatus: newMatches === totalPairs ? 'won' : 'playing',
      };
    }

    case 'MISMATCH':
      return { ...state, mismatchedCardIds: action.cardIds };

    case 'UNFLIP':
      return {
        ...state,
        cards: state.cards.map((c) =>
          action.cardIds.includes(c.id) ? { ...c, isFlipped: false } : c
        ),
        flippedCards: [],
        mismatchedCardIds: [],
        isProcessing: false,
        combo: 0,
      };

    case 'WIN':
      return { ...state, gameStatus: 'won' };

    case 'TICK':
      return { ...state, elapsedSeconds: state.elapsedSeconds + 1 };

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted };

    case 'HINT_ON':
      return {
        ...state,
        cards: state.cards.map((c) =>
          action.cardIds.includes(c.id) ? { ...c, isHighlighted: true } : c
        ),
      };

    case 'HINT_OFF':
      return {
        ...state,
        cards: state.cards.map((c) =>
          action.cardIds.includes(c.id) ? { ...c, isHighlighted: false } : c
        ),
      };

    case 'HINT_PENALTY':
      return { ...state, score: Math.max(0, state.score - 30) };

    case 'SET_BEST':
      return { ...state, bestScore: action.score, bestTime: action.time };

    case 'NEW_BEST':
      return {
        ...state,
        bestScore: action.score,
        bestTime: action.time,
        isNewBestScore: true,
      };

    default:
      return state;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Home() {
  const [state, dispatch] = useReducer(gameReducer, undefined, createInitialState);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<NodeJS.Timeout | null>(null);
  // Stable refs for values needed inside callbacks/timeouts
  const elapsedRef = useRef(0);
  const difficultyRef = useRef<DifficultyId>('medium');
  const themeRef = useRef<ThemeId>('space');

  // Sync refs after render (not during) via useLayoutEffect
  useLayoutEffect(() => {
    elapsedRef.current = state.elapsedSeconds;
    difficultyRef.current = state.difficulty;
    themeRef.current = state.theme;
  });

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    timerRef.current = setInterval(() => dispatch({ type: 'TICK' }), 1000);
  }, [stopTimer]);

  const startNewGame = useCallback(
    (difficulty: DifficultyId, theme: ThemeId) => {
      stopTimer();
      if (previewRef.current) clearTimeout(previewRef.current);

      const best = loadBest(difficulty);
      dispatch({ type: 'NEW_GAME', difficulty, theme });
      dispatch({ type: 'SET_BEST', score: best.score, time: best.time });

      previewRef.current = setTimeout(() => {
        dispatch({ type: 'START_PLAYING' });
        startTimer();
      }, DIFFICULTIES[difficulty].previewTimeMs);
    },
    [stopTimer, startTimer]
  );

  // Mount: load best score and start preview then game
  useEffect(() => {
    const best = loadBest('medium');
    dispatch({ type: 'SET_BEST', score: best.score, time: best.time });

    previewRef.current = setTimeout(() => {
      dispatch({ type: 'START_PLAYING' });
      startTimer();
    }, DIFFICULTIES['medium'].previewTimeMs);

    return () => {
      stopTimer();
      if (previewRef.current) clearTimeout(previewRef.current);
    };
    // Intentional empty deps: runs only on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop timer on win
  useEffect(() => {
    if (state.gameStatus === 'won') {
      stopTimer();
      soundFx.playWin();

      const finalScore = state.score;
      const elapsed = elapsedRef.current;
      const diff = difficultyRef.current;
      const best = loadBest(diff);
      if (finalScore > (best.score ?? 0)) {
        saveBest(diff, finalScore, elapsed);
        dispatch({ type: 'NEW_BEST', score: finalScore, time: elapsed });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.gameStatus]);

  // ── Card Click ──────────────────────────────────────────────────────────────

  const handleCardClick = useCallback(
    (clickedCard: CardItem) => {
      if (
        state.isProcessing ||
        state.gameStatus !== 'playing' ||
        clickedCard.isFlipped ||
        clickedCard.isMatched ||
        state.flippedCards.length >= 2
      )
        return;

      soundFx.playFlip();
      dispatch({ type: 'FLIP_CARD', card: clickedCard });

      const newFlipped = [...state.flippedCards, clickedCard];
      if (newFlipped.length < 2) return;

      const [card1, card2] = newFlipped;

      if (card1.symbolId === card2.symbolId) {
        setTimeout(() => {
          soundFx.playMatch();
          const newCombo = state.combo + 1;
          const points = calculateMatchScore(newCombo, difficultyRef.current);
          dispatch({ type: 'MATCH', symbolId: card1.symbolId, points, newCombo });
        }, 300);
      } else {
        setTimeout(() => {
          soundFx.playMismatch();
          dispatch({ type: 'MISMATCH', cardIds: [card1.id, card2.id] });

          setTimeout(() => {
            dispatch({ type: 'UNFLIP', cardIds: [card1.id, card2.id] });
          }, 600);
        }, 300);
      }
    },
    [state]
  );

  // ── Hint ────────────────────────────────────────────────────────────────────

  const handleGiveHint = useCallback(() => {
    if (state.isProcessing || state.gameStatus !== 'playing') return;

    const unmatched = state.cards.filter((c) => !c.isMatched && !c.isFlipped);
    if (unmatched.length < 2) return;

    const pair = unmatched.filter((c) => c.symbolId === unmatched[0].symbolId);
    if (pair.length !== 2) return;

    const hintIds = pair.map((c) => c.id);
    dispatch({ type: 'HINT_PENALTY' });
    dispatch({ type: 'HINT_ON', cardIds: hintIds });

    setTimeout(() => {
      dispatch({ type: 'HINT_OFF', cardIds: hintIds });
    }, 1200);
  }, [state]);

  // ── Sound ───────────────────────────────────────────────────────────────────

  const handleToggleSound = () => {
    dispatch({ type: 'TOGGLE_MUTE' });
    soundFx.setMuted(!state.isMuted);
  };

  // ── Derived values ──────────────────────────────────────────────────────────

  const totalPairs = DIFFICULTIES[state.difficulty].pairs;

  return (
    <main className="min-h-screen w-full px-4 py-6 flex flex-col justify-between items-center">
      <div className="w-full">
        <Header
          isMuted={state.isMuted}
          onToggleSound={handleToggleSound}
          bestScore={state.bestScore}
          bestTime={state.bestTime}
        />

        <StatsBar
          moves={state.moves}
          matches={state.matches}
          totalPairs={totalPairs}
          score={state.score}
          combo={state.combo}
          elapsedSeconds={state.elapsedSeconds}
        />

        <Controls
          difficulty={state.difficulty}
          theme={state.theme}
          onSelectDifficulty={(d) => startNewGame(d, themeRef.current)}
          onSelectTheme={(t) => startNewGame(difficultyRef.current, t)}
          onNewGame={() => startNewGame(difficultyRef.current, themeRef.current)}
          onGiveHint={handleGiveHint}
          isHintDisabled={state.isProcessing || state.gameStatus !== 'playing'}
        />

        <GameBoard
          cards={state.cards}
          difficulty={state.difficulty}
          onCardClick={handleCardClick}
          mismatchedCardIds={state.mismatchedCardIds}
        />
      </div>

      <footer className="w-full text-center py-4 text-xs text-slate-500 font-medium mt-8 border-t border-white/5">
        Jogo da Memória • Desenvolvido com Next.js, React e Tailwind CSS
      </footer>

      <WinModal
        isOpen={state.gameStatus === 'won'}
        moves={state.moves}
        score={state.score}
        elapsedSeconds={state.elapsedSeconds}
        totalPairs={totalPairs}
        maxCombo={state.maxCombo}
        isNewBestScore={state.isNewBestScore}
        onPlayAgain={() => startNewGame(difficultyRef.current, themeRef.current)}
      />
    </main>
  );
}
