export type DifficultyId = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyConfig {
  id: DifficultyId;
  name: string;
  rows: number;
  cols: number;
  pairs: number;
  previewTimeMs: number;
}

export type ThemeId = 'space' | 'animals' | 'fantasy' | 'retro';

export interface ThemeSymbol {
  id: string;
  emoji: string;
  name: string;
  color: string;
}

export interface CardItem {
  id: string;
  symbolId: string;
  emoji: string;
  name: string;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
  isHighlighted?: boolean;
}

export type GameStatus = 'idle' | 'playing' | 'paused' | 'won';

export interface GameStats {
  moves: number;
  matches: number;
  totalPairs: number;
  score: number;
  combo: number;
  maxCombo: number;
  elapsedSeconds: number;
  bestScore: number | null;
  bestTime: number | null;
}
