import { CardItem, DifficultyId, ThemeId } from '../types/game';
import { DIFFICULTIES, THEMES } from './themes';

/**
 * Fisher-Yates array shuffle algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Generate paired card deck for given difficulty and theme
 */
export function generateDeck(difficultyId: DifficultyId, themeId: ThemeId): CardItem[] {
  const config = DIFFICULTIES[difficultyId];
  const theme = THEMES[themeId];

  // Pick required number of unique symbols
  const selectedSymbols = shuffleArray(theme.symbols).slice(0, config.pairs);

  // Duplicate each symbol to create matching pairs
  const cards: CardItem[] = [];
  selectedSymbols.forEach((sym, index) => {
    // Card 1 of pair
    cards.push({
      id: `card-${index}-a`,
      symbolId: sym.id,
      emoji: sym.emoji,
      name: sym.name,
      color: sym.color,
      isFlipped: false,
      isMatched: false,
    });
    // Card 2 of pair
    cards.push({
      id: `card-${index}-b`,
      symbolId: sym.id,
      emoji: sym.emoji,
      name: sym.name,
      color: sym.color,
      isFlipped: false,
      isMatched: false,
    });
  });

  return shuffleArray(cards);
}

/**
 * Calculate match score based on time, combo, and difficulty
 */
export function calculateMatchScore(combo: number, difficultyId: DifficultyId): number {
  const basePoints = 100;
  const comboBonus = (combo - 1) * 50;
  const difficultyMultiplier =
    difficultyId === 'easy' ? 1 : difficultyId === 'medium' ? 1.5 : difficultyId === 'hard' ? 2 : 2.5;

  return Math.round((basePoints + comboBonus) * difficultyMultiplier);
}

/**
 * Format seconds to MM:SS string
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Calculate star rating (1 to 3 stars) based on moves taken relative to minimum moves
 */
export function calculateStarRating(moves: number, totalPairs: number): number {
  const minMoves = totalPairs;
  if (moves <= minMoves * 1.3) return 3;
  if (moves <= minMoves * 2.0) return 2;
  return 1;
}
