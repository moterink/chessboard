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
  origin: Square;
  target: Square;
}> {
  constructor(origin: Square, target: Square) {
    super('piecedrop', {
      detail: { origin, target },
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
