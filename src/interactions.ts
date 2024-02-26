import { Piece } from './pieces';
import { Coordinates } from './types';

type DragEventName = keyof GlobalEventHandlersEventMap;
type DragEvent<T extends DragEventName> = GlobalEventHandlersEventMap[T];

type MoveCallback<T extends DragEventName> = (
  event: DragEvent<T>,
) => Coordinates;
type EndCallback<T extends DragEventName> = (
  event: DragEvent<T>,
) => Coordinates;
export type DragStartHandler = (
  pieceElement: Piece,
  onDrop: DropCallback,
) => void;
export type DropCallback = (coordinates: Coordinates) => void;

export const getRelativeCoordinates = (
  absoluteCoordinates: Coordinates,
  referenceContainer: HTMLElement | null,
) => {
  const rect = referenceContainer?.getBoundingClientRect();
  return {
    x: absoluteCoordinates.x - (rect?.left ?? 0),
    y: absoluteCoordinates.y - (rect?.top ?? 0),
  };
};

export const snapPieceToCoordinates = (
  pieceElement: Piece,
  coordinates: Coordinates,
) => {
  const rect = pieceElement.getBoundingClientRect();
  const offset = rect.width / 2;
  pieceElement.style.transform = `translate3d(${coordinates.x - offset}px, ${
    coordinates.y - offset
  }px, 0px)`;
};

const startPieceDrag = <T extends keyof GlobalEventHandlersEventMap>(
  pieceElement: Piece,
  moveEvent: T,
  endEvent: T,
  onMove: MoveCallback<T>,
  onEnd: EndCallback<T>,
  onDrop: DropCallback,
) => {
  pieceElement.classList.add('dragging');

  const pieceMoveHandler = (event: GlobalEventHandlersEventMap[T]) => {
    const coordinates = onMove(event);

    snapPieceToCoordinates(
      pieceElement,
      getRelativeCoordinates(coordinates, pieceElement.parentElement),
    );
  };

  const pieceDropHandler = (event: GlobalEventHandlersEventMap[T]) => {
    const coordinates = onEnd(event);
    document.removeEventListener(moveEvent, pieceMoveHandler);

    pieceElement.classList.remove('dragging');

    onDrop(getRelativeCoordinates(coordinates, pieceElement.parentElement));
  };

  document.addEventListener(moveEvent, pieceMoveHandler);
  document.addEventListener(endEvent, pieceDropHandler, { once: true });
};

export const startPieceTouchDrag = (
  pieceElement: Piece,
  onDrop: DropCallback,
) => {
  const pieceTouchMoveHandler = (event: TouchEvent) => {
    event.preventDefault();

    const touch = event.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  };

  const pieceTouchEndHandler = (event: TouchEvent) => {
    event.preventDefault();

    const touch = event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  };

  startPieceDrag(
    pieceElement,
    'touchmove',
    'touchend',
    pieceTouchMoveHandler,
    pieceTouchEndHandler,
    onDrop,
  );
};

export const startPieceMouseDrag = (
  pieceElement: Piece,
  onDrop: DropCallback,
) => {
  pieceElement.classList.add('dragging');

  const pieceMouseMoveHandler = (event: MouseEvent) => ({
    x: event.clientX,
    y: event.clientY,
  });

  const pieceMouseUpHandler = (event: MouseEvent) => ({
    x: event.clientX,
    y: event.clientY,
  });

  startPieceDrag(
    pieceElement,
    'mousemove',
    'mouseup',
    pieceMouseMoveHandler,
    pieceMouseUpHandler,
    onDrop,
  );
};
