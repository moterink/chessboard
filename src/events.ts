import { Square } from './types';

declare global {
  interface GlobalEventHandlersEventMap {
    piececlick: PieceClickEvent;
    squareclick: SquareClickEvent;
  }
}

export class PieceClickEvent extends CustomEvent<{ square: Square }> {
  constructor(square: Square) {
    super('piececlick', { detail: { square }, bubbles: true, composed: true });
  }
}

export class SquareClickEvent extends CustomEvent<{ square: Square }> {
  constructor(square: Square) {
    super('squareclick', { detail: { square }, bubbles: true, composed: true });
  }
}
