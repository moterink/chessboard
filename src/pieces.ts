import { PieceClickEvent, SquareClickEvent } from './events';
import {
  DragStartHandler,
  getRelativeCoordinates,
  snapPieceToCoordinates,
  startPieceMouseDrag,
  startPieceTouchDrag,
} from './interactions';
import { INITIAL_POSITION_FEN } from './constants';
import { PieceNotFoundError } from './errors';
import Position from './position';
import { getSquareByCoordinates, getSquareTranslate } from './squares';
import type {
  ActiveColor,
  Color,
  Coordinates,
  PieceType,
  Square,
} from './types';

const shouldAnimate = (
  enableAnimations: boolean,
  immediate?: boolean,
): boolean => (immediate !== undefined ? !immediate : enableAnimations);

export class Piece extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.part.add('pieces');
  }

  get active() {
    return this.classList.contains('active');
  }

  get color() {
    return this.part[0] as Color;
  }

  set color(value: Color) {
    this.part.add(value);
  }

  get type() {
    return this.part[1] as PieceType;
  }

  set type(value: PieceType) {
    this.part.add(value);
  }

  setTranslate(translate: string, animate = false) {
    if (animate) {
      this.addEventListener(
        'transitionend',
        () => {
          this.classList.remove('moving');
        },
        { once: true },
      );
      this.classList.add('moving');
      // We have to wrap this in a timeout, otherwise it could
      // happen that the initial transform has not been applied yet and
      // there is no move transition triggered at all.
      // Appears to only happen when e.g. FEN was set immediately after the board
      // element was added to the DOM.
      setTimeout(() => (this.style.transform = translate));
    } else {
      this.style.transform = translate;
    }
  }

  appear() {
    this.addEventListener(
      'animationend',
      () => {
        this.classList.remove('adding');
      },
      { once: true },
    );
    this.classList.add('adding');
  }

  remove(animate = false) {
    if (animate) {
      this.addEventListener(
        'animationend',
        () => {
          super.remove();
        },
        { once: true },
      );
      this.classList.add('removing');
    } else {
      super.remove();
    }
  }

  activate() {
    this.classList.add('active');
  }

  deactivate() {
    this.classList.remove('active');
  }
}

customElements.define('cb-piece', Piece);

export class Pieces extends HTMLElement {
  private _position = Position.fromFen(INITIAL_POSITION_FEN);
  private _orientation: Color = 'white';
  private _enableAnimations = true;

  private _mayDropCallback?: (from: Square, to: Square) => boolean = () => true;

  constructor() {
    super();
  }

  connectedCallback() {
    for (const [square, piece] of this.position.entries()) {
      if (piece) {
        piece.setTranslate(getSquareTranslate(square, this.orientation));
        this.appendChild(piece);
      }
    }

    this.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.addEventListener('touchstart', this.handleTouchStart.bind(this));
  }

  set active(value: ActiveColor) {
    switch (value) {
      case 'both':
        this.position.pieces
          .filter((p) => !p.active)
          .forEach((p) => p.activate());
        break;
      case 'none':
        this.position.pieces
          .filter((p) => p.active)
          .forEach((p) => p.deactivate());
        break;
      default:
        this.position.pieces.forEach((p) =>
          p.color === value ? p.activate() : p.deactivate(),
        );
        break;
    }
  }

  get position() {
    return this._position;
  }

  set position(value: Position) {
    this._position = value;
  }

  get squareSize() {
    return this.getBoundingClientRect().width / 8;
  }

  get enableAnimations() {
    return this.isConnected && this._enableAnimations;
  }

  set enableAnimations(value: boolean) {
    this._enableAnimations = value;
  }

  get orientation() {
    return this._orientation;
  }

  set orientation(value: Color) {
    this._orientation = value;
    for (const [square, piece] of this.position.entries()) {
      if (piece) {
        piece.setTranslate(
          getSquareTranslate(square as Square, this.orientation),
        );
      }
    }
  }

  set fen(value: string) {
    const transition = this._position.calculateTransition(value);

    for (const [square, piece] of transition.addedPieces.entries()) {
      piece.setTranslate(getSquareTranslate(square, this.orientation));
      piece.appear();
      this.appendChild(piece);
    }

    for (const piece of transition.removedPieces) {
      piece.remove(this.enableAnimations);
    }

    for (const [square, piece] of transition.movedPieces.entries()) {
      piece.setTranslate(
        getSquareTranslate(square, this.orientation),
        this.enableAnimations,
      );
    }

    this.propagateTransitionEnd();
  }

  set mayDrop(cb: (from: Square, to: Square) => boolean) {
    this._mayDropCallback = cb;
  }

  addPiece(color: Color, type: PieceType, square: Square, immediate = false) {
    const piece = new Piece();
    piece.color = color;
    piece.type = type;
    if (shouldAnimate(this.enableAnimations, immediate)) {
      piece.appear();
    }
    this.appendChild(piece);
    this.position.addPiece(piece, square);
  }

  removePiece(square: Square, immediate = false) {
    const piece = this.position.get(square);
    if (!piece) {
      throw new PieceNotFoundError(square);
    }
    piece.remove(shouldAnimate(this.enableAnimations, immediate));
    this.position.removePiece(square);
  }

  movePiece(from: Square, to: Square, immediate = false) {
    const originPiece = this.position.get(from);
    if (originPiece) {
      const animate = shouldAnimate(this.enableAnimations, immediate);
      const targetPiece = this.position.get(to);
      // If there is already a piece at the target square, remove it first
      if (targetPiece) {
        targetPiece.remove(animate);
      }
      originPiece.setTranslate(
        getSquareTranslate(to, this.orientation),
        animate,
      );
      this.position.movePiece(from, to);
    }
  }

  private get isAnimating() {
    return this.getAnimations({ subtree: true }).length > 0;
  }

  private propagateTransitionEnd() {
    this.addEventListener(
      'transitionend',
      () => {
        this.dispatchEvent(
          new Event('transitionend', { composed: true, bubbles: true }),
        );
      },
      { once: true },
    );
  }

  private handleTouchStart(event: TouchEvent) {
    event.preventDefault();

    // Ignore touch events with more than one fingers
    if (event.touches.length > 1 || this.isAnimating) {
      return;
    }

    const touch = event.touches[0];
    const absoluteCoordinates = { x: touch.clientX, y: touch.clientY };

    this.handleDragStart(absoluteCoordinates, startPieceTouchDrag);
  }

  private handleMouseDown(event: MouseEvent) {
    // Do not allow mouse down when there is an on-going animation
    if (event.button !== 0 || this.isAnimating) {
      return;
    }

    const absoluteCoordinates = { x: event.clientX, y: event.clientY };

    this.handleDragStart(absoluteCoordinates, startPieceMouseDrag);
  }

  private handleDragStart(
    absoluteCoordinates: Coordinates,
    startPieceDrag: DragStartHandler,
  ) {
    const relativeCoordinates = getRelativeCoordinates(
      absoluteCoordinates,
      this,
    );
    const square = getSquareByCoordinates(
      relativeCoordinates,
      this.squareSize,
      this.orientation,
    );

    if (!square) {
      // not a square - early exit
      return;
    }

    const piece = this.position.get(square);
    if (!piece || !piece.active) {
      this.dispatchEvent(new SquareClickEvent(square));
      return;
    }

    // immediately snap clicked piece to cursor
    snapPieceToCoordinates(piece, relativeCoordinates);
    startPieceDrag(piece, (dropCoordinates) => {
      const dropSquare = getSquareByCoordinates(
        dropCoordinates,
        this.squareSize,
        this.orientation,
      );
      if (dropSquare) {
        if (square === dropSquare) {
          this.dispatchEvent(new PieceClickEvent(square));
          piece.setTranslate(getSquareTranslate(square, this.orientation));
          return;
        }

        if (this._mayDropCallback?.(square, dropSquare)) {
          piece.setTranslate(getSquareTranslate(dropSquare, this.orientation));
          this.movePiece(square, dropSquare, true);
          return;
        }
      }

      // snapback
      piece.setTranslate(getSquareTranslate(square, this.orientation));
    });
  }
}

customElements.define('cb-pieces', Pieces);

export default Piece;
