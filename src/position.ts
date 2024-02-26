import { Piece } from './pieces';
import { distance, getSquareByIndex } from './squares';
import { Color, Move, PieceAndColor, PieceType, Square } from './types';

const arePiecesEqual = (
  piece1: PieceAndColor | null | undefined,
  piece2: PieceAndColor | null | undefined,
): boolean => {
  return piece1?.color === piece2?.color && piece1?.type === piece2?.type;
};

export type PositionTransition = {
  addedPieces: Map<Square, Piece>;
  removedPieces: Piece[];
  movedPieces: Map<Square, Piece>;
};

type FenPieceChar = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

const FENPieceCharToPieceType: Record<FenPieceChar, PieceType> = {
  p: 'pawn',
  b: 'bishop',
  n: 'knight',
  r: 'rook',
  q: 'queen',
  k: 'king',
};

class Position extends Map<Square, Piece | null> {
  static fromFen(fen: string): Position {
    const pos = new Position();

    let fenIndex = 0;
    let squareIndex = 0;
    // Loop over each character of the FEN string
    while (fenIndex < fen.length) {
      const character = fen[fenIndex];
      switch (character) {
        case '/':
        case ' ':
          break;
        default:
          if (isNaN(Number(character))) {
            const square = getSquareByIndex(squareIndex);
            const piece = new Piece();
            piece.id = piece.color =
              character === character.toUpperCase() ? 'white' : 'black';
            piece.type =
              FENPieceCharToPieceType[character.toLowerCase() as FenPieceChar];
            pos.addPiece(piece, square);
            squareIndex++;
          } else {
            for (let i = 0; i < Number(character); i++) {
              const square = getSquareByIndex(squareIndex++);
              pos.set(square, null);
            }
          }
          break;
      }
      if (character === ' ') {
        break;
      }
      fenIndex++;
    }

    return pos;
  }

  private generateUniquePieceId(color: Color, type: PieceType) {
    const pieceIds = Array.from(this.values())
      .filter((p) => p !== null)
      .map((p) => p!.id);
    let index = 1;
    let id = `${color.charAt(0)}${Object.keys(FENPieceCharToPieceType).find(
      (k) => FENPieceCharToPieceType[k as FenPieceChar] === type,
    )}${index}`;
    while (pieceIds.includes(id)) {
      id = id.slice(0, -1) + String(++index);
    }
    return id;
  }

  addPiece(piece: Piece, square: Square) {
    piece.id = this.generateUniquePieceId(piece.color, piece.type);
    this.set(square, piece);
  }

  removePiece(square: Square): Piece {
    const piece = this.get(square);
    this.set(square, null);
    return piece!;
  }

  movePiece(from: Square, to: Square) {
    const piece = this.get(from);
    if (!piece) {
      throw new Error(
        `cannot move from ${from} to ${to}; no piece found at ${to}`,
      );
    }

    this.set(to, piece);
    this.set(from, null);
  }

  get pieces() {
    return Array.from(this.values()).filter(
      (entry) => entry !== null,
    ) as Piece[];
  }

  get piecesCount() {
    return this.pieces.length;
  }

  calculateTransition(fen: string): PositionTransition {
    const newPosition = Position.fromFen(fen);

    const addedPieces = new Map<Square, PieceAndColor>();
    const removedPieces = new Map<Square, PieceAndColor>();
    const movedPieces: ({ piece: Piece } & Move)[] = [];

    for (const [square, piece] of Array.from(newPosition.entries())) {
      const oldPiece = this.get(square);

      if (!arePiecesEqual(oldPiece, piece)) {
        if (oldPiece) {
          removedPieces.set(square, {
            color: oldPiece.color,
            type: oldPiece.type,
          });
        }
        if (piece !== null) {
          addedPieces.set(square, { color: piece.color, type: piece.type });
        }
      }
    }

    for (const [addedSquare, addedPiece] of addedPieces) {
      let candidateSquare: Square | undefined;
      let minDistance = 10;
      for (const [removedSquare, removedPiece] of removedPieces) {
        if (arePiecesEqual(addedPiece, removedPiece)) {
          const d = distance(addedSquare, removedSquare);
          if (d < minDistance) {
            minDistance = d;
            candidateSquare = removedSquare;
          }
        }
      }
      if (candidateSquare) {
        removedPieces.delete(candidateSquare);
        addedPieces.delete(addedSquare);
        movedPieces.push({
          piece: this.get(candidateSquare)!,
          from: candidateSquare,
          to: addedSquare,
        });
      }
    }

    const transition: PositionTransition = {
      addedPieces: new Map(),
      removedPieces: [],
      movedPieces: new Map(),
    };

    for (const [square, { color, type }] of addedPieces) {
      const piece = new Piece();
      piece.color = color;
      piece.type = type;
      this.addPiece(piece, square);
      transition.addedPieces.set(square, piece);
    }

    for (const square of removedPieces.keys()) {
      transition.removedPieces.push(this.removePiece(square));
    }

    for (const { piece, from, to } of movedPieces) {
      this.set(from, null);
      this.set(to, piece);
      transition.movedPieces.set(to, piece);
    }

    return transition;
  }
}

export default Position;
