import {
  type Square,
  type Color,
  type FileRankIndices,
  type Coordinates,
  type Rank,
  type File,
} from './types';
import { FILES, RANKS } from './constants';

export const distance = (square1: Square, square2: Square): number => {
  const fileDistance = Math.abs(square1.charCodeAt(0) - square2.charCodeAt(0));
  const rankDistance = Math.abs(
    Number(square1.charAt(1)) - Number(square2.charAt(1)),
  );
  return Math.sqrt(Math.pow(fileDistance, 2) + Math.pow(rankDistance, 2));
};

export const getSquareByIndex = (index: number): Square => {
  console.assert(index >= 0 && index < 64);
  const rank = Math.floor(index / 8);
  const file = index % 8;
  return (FILES[file] + RANKS[7 - rank]) as Square;
};

export const getRelativeFileRank = (
  square: Square,
  orientation: Color,
): FileRankIndices => {
  const file = FILES.indexOf(square[0] as File);
  const rank = RANKS.indexOf(square[1] as Rank);
  return {
    file: orientation === 'white' ? file : 7 - file,
    rank: orientation === 'white' ? 7 - rank : rank,
  };
};

export const getSquareCoordinates = (
  square: Square,
  squareSize: number,
  orientation: Color,
): Coordinates => {
  const indices = getRelativeFileRank(square, orientation);
  return { x: squareSize * indices.file, y: squareSize * indices.rank };
};

export function getSquareOffsetPercentages(
  square: Square,
  orientation: Color,
): { x: number; y: number } {
  const indices = getRelativeFileRank(square, orientation);
  return {
    x: indices.file * 100,
    y: indices.rank * 100,
  };
}

export const getSquareByCoordinates = (
  coordinates: Coordinates,
  squareSize: number,
  orientation: Color,
): Square | undefined => {
  if (
    coordinates.x >= 0 &&
    coordinates.x <= squareSize * 8 &&
    coordinates.y >= 0 &&
    coordinates.y <= squareSize * 8
  ) {
    const file = Math.min(7, Math.floor(coordinates.x / squareSize));
    const rank = Math.min(7, Math.floor(coordinates.y / squareSize));

    return (FILES[orientation === 'white' ? file : 7 - file] +
      RANKS[orientation === 'white' ? 7 - rank : rank]) as Square;
  }
};

export const getSquareTranslate = (
  square: Square,
  orientation: Color,
): string => {
  const offset = getSquareOffsetPercentages(square, orientation);
  return `translate3d(${offset.x}%, ${offset.y}%, 0px)`;
};
