import {
  ACTIVE_COLORS,
  COLORS,
  FILES,
  OBSERVED_ATTRIBUTES,
  RANKS,
} from './constants';

export type ObservedAttribute = (typeof OBSERVED_ATTRIBUTES)[number];

export type File = (typeof FILES)[number];
export type Rank = (typeof RANKS)[number];

export type Square = `${File}${Rank}`;

export type Color = (typeof COLORS)[number];

export type ActiveColor = (typeof ACTIVE_COLORS)[number];

export type PieceType =
  | 'pawn'
  | 'knight'
  | 'bishop'
  | 'rook'
  | 'queen'
  | 'king';

export type PieceAndColor = {
  color: Color;
  type: PieceType;
};

export type FileRankIndices = {
  file: number;
  rank: number;
};

export type Coordinates = {
  x: number;
  y: number;
};

export type Move = {
  from: Square;
  to: Square;
};
