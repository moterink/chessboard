export const Files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
export const Ranks = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

export type File = (typeof Files)[number];
export type Rank = (typeof Ranks)[number];

export type Square = `${File}${Rank}`;

export const Colors = ['white', 'black'] as const;
export type Color = (typeof Colors)[number];

export const ActiveColors = [...Colors, 'both', 'none'] as const;
export type ActiveColor = (typeof ActiveColors)[number];

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

export type PieceAndColorWithSquare = PieceAndColor & {
  square: Square;
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
