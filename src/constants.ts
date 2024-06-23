export const CUSTOM_ELEMENT_NAME = 'chess-board';

export const OBSERVED_ATTRIBUTES = [
  'active',
  'size',
  'show-coordinates',
  'fen',
  'orientation',
] as const;

export const INITIAL_POSITION_FEN =
  'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export const COLORS = ['white', 'black'] as const;

export const ACTIVE_COLORS = [...COLORS, 'both', 'none'] as const;
