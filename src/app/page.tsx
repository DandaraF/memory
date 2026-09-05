'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Header } from '../components/Header';
import { StatsBar } from '../components/StatsBar';
import { Controls } from '../components/Controls';
import { GameBoard } from '../components/GameBoard';
import { WinModal } from '../components/WinModal';
import { CardItem, DifficultyId, GameStatus, ThemeId } from '../types/game';
import { DIFFICULTIES } from '../lib/themes';
import {
  generateDeck,
  calculateMatchScore,
} from '../lib/gameLogic';
import { soundFx } from '../lib/audio';

export default function Home() {
  const [difficulty, setDifficulty] = useState<DifficultyId>('medium');
  const [theme, setTheme] = useState<ThemeId>('space');

  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<CardItem[]>([]);
  const [mismatchedCardIds, setMismatchedCardIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [moves, setMoves] = useState<number>(0);
  const [matches, setMatches] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [bestScore, setBestScore] = useState<number | null>(null);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [isNewBestScore, setIsNewBestScore] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load high score from localStorage on mount & when difficulty changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedScore = localStorage.getItem(`memory_best_score_${difficulty}`);
      const savedTime = localStorage.getItem(`memory_best_time_${difficulty}`);
      setBestScore(savedScore ? parseInt(savedScore, 10) : null);
      setBestTime(savedTime ? parseInt(savedTime, 10) : null);
    }
  }, [difficulty]);

  // Start initial game
  const initGame = useCallback(
    (diffId: DifficultyId = difficulty, themeId: ThemeId = theme) => {
      // Clear timers
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

      const deck = generateDeck(diffId, themeId);
      setCards(deck);
      setFlippedCards([]);
      setMismatchedCardIds([]);
      setIsProcessing(true);

      setMoves(0);
      setMatches(0);
      setScore(0);
      setCombo(0);
      setMaxCombo(0);
      setElapsedSeconds(0);
      setIsNewBestScore(false);

      // Brief card preview on startup
      const previewTime = DIFFICULTIES[diffId].previewTimeMs;
      
      // Temporarily flip all cards for preview
      setCards((prevDeck) => prevDeck.map((c) => ({ ...c, isFlipped: true })));
      setGameStatus('idle');

      previewTimerRef.current = setTimeout(() => {
        setCards((prevDeck) => prevDeck.map((c) => ({ ...c, isFlipped: false })));
        setIsProcessing(false);
        setGameStatus('playing');
      }, previewTime);
    },
    [difficulty, theme]
  );

  useEffect(() => {
    initGame(difficulty, theme);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [initGame, difficulty, theme]);

  // Timer interval effect
  useEffect(() => {
    if (gameStatus === 'playing') {
      timerRef.current = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameStatus]);

  // Handle Card Click
  const handleCardClick = (clickedCard: CardItem) => {
    if (
      isProcessing ||
      gameStatus !== 'playing' ||
      clickedCard.isFlipped ||
      clickedCard.isMatched ||
      flippedCards.length >= 2
    ) {
      return;
    }

    soundFx.playFlip();

    // Flip the clicked card
    const updatedCards = cards.map((c) =>
      c.id === clickedCard.id ? { ...c, isFlipped: true } : c
    );
    setCards(updatedCards);

    const newFlipped = [...flippedCards, clickedCard];
    setFlippedCards(newFlipped);

    // If 2 cards flipped, check for match
    if (newFlipped.length === 2) {
      setMoves((prev) => prev + 1);
      setIsProcessing(true);

      const [card1, card2] = newFlipped;

      if (card1.symbolId === card2.symbolId) {
        // MATCH!
        setTimeout(() => {
          soundFx.playMatch();
          const newCombo = combo + 1;
          setCombo(newCombo);
          setMaxCombo((prevMax) => Math.max(prevMax, newCombo));

          const matchPoints = calculateMatchScore(newCombo, difficulty);
          setScore((prevScore) => prevScore + matchPoints);

          setCards((prev) =>
            prev.map((c) =>
              c.symbolId === card1.symbolId ? { ...c, isMatched: true } : c
            )
          );

          const newMatches = matches + 1;
          setMatches(newMatches);
          setFlippedCards([]);
          setIsProcessing(false);

          // Check Win Condition
          const totalPairs = DIFFICULTIES[difficulty].pairs;
          if (newMatches === totalPairs) {
            handleWin(score + matchPoints);
          }
        }, 300);
      } else {
        // MISMATCH!
        setTimeout(() => {
          soundFx.playMismatch();
          setCombo(0); // Reset combo chain
          setMismatchedCardIds([card1.id, card2.id]);

          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === card1.id || c.id === card2.id
                  ? { ...c, isFlipped: false }
                  : c
              )
            );
            setMismatchedCardIds([]);
            setFlippedCards([]);
            setIsProcessing(false);
          }, 600);
        }, 300);
      }
    }
  };

  // Handle Win Event
  const handleWin = (finalScore: number) => {
    setGameStatus('won');
    soundFx.playWin();

    if (typeof window !== 'undefined') {
      const savedScore = localStorage.getItem(`memory_best_score_${difficulty}`);
      const currentBest = savedScore ? parseInt(savedScore, 10) : 0;

      if (finalScore > currentBest) {
        localStorage.setItem(`memory_best_score_${difficulty}`, finalScore.toString());
        localStorage.setItem(`memory_best_time_${difficulty}`, elapsedSeconds.toString());
        setBestScore(finalScore);
        setBestTime(elapsedSeconds);
        setIsNewBestScore(true);
      }
    }
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundFx.setMuted(nextMuted);
  };

  // Give Hint: Briefly highlight an un-matched pair
  const handleGiveHint = () => {
    if (isProcessing || gameStatus !== 'playing') return;

    // Find unmatched cards
    const unmatchedCards = cards.filter((c) => !c.isMatched && !c.isFlipped);
    if (unmatchedCards.length < 2) return;

    // Select first unmatched symbol
    const firstCard = unmatchedCards[0];
    const matchingCards = unmatchedCards.filter(
      (c) => c.symbolId === firstCard.symbolId
    );

    if (matchingCards.length === 2) {
      setScore((prev) => Math.max(0, prev - 30)); // Small penalty for hint
      const hintIds = matchingCards.map((c) => c.id);

      setCards((prev) =>
        prev.map((c) =>
          hintIds.includes(c.id) ? { ...c, isHighlighted: true } : c
        )
      );

      setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            hintIds.includes(c.id) ? { ...c, isHighlighted: false } : c
          )
        );
      }, 1200);
    }
  };

  const totalPairs = DIFFICULTIES[difficulty].pairs;

  return (
    <main className="min-h-screen w-full px-4 py-6 flex flex-col justify-between items-center bg-radial-theme">
      <div className="w-full">
        <Header
          isMuted={isMuted}
          onToggleSound={handleToggleSound}
          bestScore={bestScore}
          bestTime={bestTime}
        />

        <StatsBar
          moves={moves}
          matches={matches}
          totalPairs={totalPairs}
          score={score}
          combo={combo}
          elapsedSeconds={elapsedSeconds}
        />

        <Controls
          difficulty={difficulty}
          theme={theme}
          onSelectDifficulty={(d) => setDifficulty(d)}
          onSelectTheme={(t) => setTheme(t)}
          onNewGame={() => initGame(difficulty, theme)}
          onGiveHint={handleGiveHint}
          isHintDisabled={isProcessing || gameStatus !== 'playing'}
        />

        <GameBoard
          cards={cards}
          difficulty={difficulty}
          onCardClick={handleCardClick}
          mismatchedCardIds={mismatchedCardIds}
        />
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-slate-500 font-medium mt-8 border-t border-white/5">
        Jogo da Memória • Desenvolvido com Next.js, React e Tailwind CSS
      </footer>

      {/* Victory Modal */}
      <WinModal
        isOpen={gameStatus === 'won'}
        moves={moves}
        score={score}
        elapsedSeconds={elapsedSeconds}
        totalPairs={totalPairs}
        maxCombo={maxCombo}
        isNewBestScore={isNewBestScore}
        onPlayAgain={() => initGame(difficulty, theme)}
      />
    </main>
  );
}
