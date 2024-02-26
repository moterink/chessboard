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
