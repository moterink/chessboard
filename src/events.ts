import { Square } from './types';

declare global {
  interface GlobalEventHandlersEventMap {
    piececlick: PieceClickEvent;
    piecedrop: PieceDropEvent;
    squareclick: SquareClickEvent;
  }
}

export class PieceClickEvent extends CustomEvent<{ square: Square }> {
  constructor(square: Square) {
    super('piececlick', { detail: { square }, bubbles: true, composed: true });
  }
}

export class PieceDropEvent extends CustomEvent<{
  from: Square;
  to: Square;
}> {
  constructor(from: Square, to: Square) {
    super('piecedrop', {
      detail: { from, to },
      bubbles: true,
      composed: true,
      cancelable: true,
    });
  }
}

export class SquareClickEvent extends CustomEvent<{ square: Square }> {
  constructor(square: Square) {
    super('squareclick', { detail: { square }, bubbles: true, composed: true });
  }
}
