import { vi, describe, test, expect, beforeEach, afterEach } from 'vitest';

import { ActiveColor, Color } from '../src/types';
import { PieceDropEvent } from '../src/events';
import { Chessboard } from '../src/board';
import { getSquareCoordinates } from '../src/squares';
import { CUSTOM_ELEMENT_NAME, ACTIVE_COLORS, COLORS } from '../src/constants';

import '../src/board';

const BOARD_SIZE = 400;
const SQUARE_SIZE = BOARD_SIZE / 8;

const documentDOMRect = {
  x: 0,
  y: 0,
  width: BOARD_SIZE,
  height: BOARD_SIZE,
  top: 0,
  left: 0,
  right: BOARD_SIZE,
  bottom: BOARD_SIZE,
} as DOMRect;

describe('Chessboard initialization', () => {
  let board: Chessboard;

  beforeEach(() => {
    board = document.createElement(CUSTOM_ELEMENT_NAME) as Chessboard;
    document.body.appendChild(board);
  });

  afterEach(() => {
    document.body.removeChild(board);
  });

  test('initial position', () => {
    expect(board).not.toBeNull();

    const pieces = board.shadowRoot?.querySelectorAll('cb-piece');

    expect(pieces).toHaveLength(32);
  });
});

describe('Chessboard attributes', () => {
  let board: Chessboard;
  let onError: VoidFunction;

  beforeEach(() => {
    board = document.createElement(CUSTOM_ELEMENT_NAME) as Chessboard;
    document.body.appendChild(board);

    onError = vi.fn();
    window.addEventListener('error', onError, {
      once: true,
    });
  });

  afterEach(() => {
    document.body.removeChild(board);
    vi.resetAllMocks();
  });

  test.each([...ACTIVE_COLORS, 'blue'])(
    'setting active attribute to %s',
    (value: string) => {
      board.setAttribute('active', value);

      if (Object.values(ACTIVE_COLORS).includes(value as ActiveColor)) {
        expect(onError).not.toHaveBeenCalled();
        expect(board.active).toBe(value);
      } else {
        expect(onError).toHaveBeenCalledTimes(1);
      }
    },
  );

  test.each([...COLORS, 'blue'])(
    'setting orientation attribute to %s',
    (value: string) => {
      board.setAttribute('orientation', value);

      if (Object.values(COLORS).includes(value as Color)) {
        expect(onError).not.toHaveBeenCalled();
        expect(board.orientation).toBe(value);
      } else {
        expect(onError).toHaveBeenCalledTimes(1);
      }
    },
  );

  test('setting show-coordinates attribute', () => {
    expect(board.showCoordinates).toBe(false);

    board.setAttribute('show-coordinates', '');
    expect(board.showCoordinates).toBe(true);

    board.removeAttribute('show-coordinates');
    expect(board.showCoordinates).toBe(false);
  });
});

describe('Chessboard coordinates', () => {
  let board: Chessboard;

  beforeEach(() => {
    board = document.createElement(CUSTOM_ELEMENT_NAME) as Chessboard;
    document.body.appendChild(board);
    board.setAttribute('show-coordinates', '');
  });

  afterEach(() => {
    document.body.removeChild(board);
  });

  test('coordinates adjust when switching orientation', () => {
    const coordinatesRanks = board.shadowRoot?.querySelector(
      'cb-coordinates-ranks',
    );
    const coordinatesFiles = board.shadowRoot?.querySelector(
      'cb-coordinates-files',
    );

    expect((coordinatesRanks!.children[0] as HTMLElement).innerText).toBe('1');
    expect((coordinatesFiles!.children[0] as HTMLElement).innerText).toBe('a');
  });
});

describe('Chessboard interactions', () => {
  let board: Chessboard;
  let piecesContainer: HTMLDivElement;

  beforeEach(() => {
    board = document.createElement(CUSTOM_ELEMENT_NAME) as Chessboard;
    document.body.appendChild(board);

    piecesContainer = board.shadowRoot?.querySelector(
      'cb-pieces',
    ) as HTMLDivElement;
    piecesContainer.getBoundingClientRect = () => documentDOMRect;
    piecesContainer.getAnimations = () => [];
  });

  afterEach(() => {
    document.body.removeChild(board);
  });

  test('click piece', async function () {
    const mockPieceClick = vi.fn();
    board.addEventListener('piececlick', mockPieceClick);

    const position = getSquareCoordinates('e2', SQUARE_SIZE, 'white');

    piecesContainer.dispatchEvent(
      new MouseEvent('mousedown', {
        clientX: position.x,
        clientY: position.y,
      }),
    );
    document.dispatchEvent(
      new MouseEvent('mouseup', {
        clientX: position.x,
        clientY: position.y,
      }),
    );

    expect(mockPieceClick).toHaveBeenCalledTimes(1);
    expect(mockPieceClick.mock.calls[0][0].detail.square).toBe('e2');
  });

  test('drag piece', () => {
    const pieceDropEventListener = vi.fn();

    board.addEventListener('piecedrop', pieceDropEventListener);

    const e2Square = getSquareCoordinates('e2', SQUARE_SIZE, 'white');
    const e4Square = getSquareCoordinates('e4', SQUARE_SIZE, 'white');

    piecesContainer.dispatchEvent(
      new MouseEvent('mousedown', {
        clientX: e2Square.x,
        clientY: e2Square.y,
      }),
    );
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: e4Square.x,
        clientY: e4Square.y,
      }),
    );

    const piece = piecesContainer.querySelector('#wp5');

    expect(piece!.classList.contains('dragging')).toBe(true);

    document.dispatchEvent(
      new MouseEvent('mouseup', {
        clientX: e4Square.x,
        clientY: e4Square.y,
      }),
    );

    expect(pieceDropEventListener).toHaveBeenCalledTimes(1);

    const { from, to } = (
      pieceDropEventListener.mock.calls[0][0] as PieceDropEvent
    ).detail;

    expect(from).toBe('e2');
    expect(to).toBe('e4');
    expect(piece!.classList.contains('dragging')).toBe(false);
  });

  test('drag piece during layout shift', () => {
    const pieceDropEventListener = vi.fn();

    board.addEventListener('piecedrop', pieceDropEventListener);

    const e2Square = getSquareCoordinates('e2', SQUARE_SIZE, 'white');
    const e4Square = getSquareCoordinates('e4', SQUARE_SIZE, 'white');

    piecesContainer.dispatchEvent(
      new MouseEvent('mousedown', {
        clientX: e2Square.x,
        clientY: e2Square.y,
      }),
    );

    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: e4Square.x,
        clientY: e4Square.y,
      }),
    );

    const piece = piecesContainer.querySelector('#wp5');

    expect(piece!.classList.contains('dragging')).toBe(true);

    piecesContainer.getBoundingClientRect = () => ({
      ...documentDOMRect,
      top: 250,
      left: 250,
    });

    document.dispatchEvent(
      new MouseEvent('mouseup', {
        // simulate shift of board
        clientX: e4Square.x + 250,
        clientY: e4Square.y + 250,
      }),
    );

    expect(pieceDropEventListener).toHaveBeenCalledTimes(1);

    const { from, to } = (
      pieceDropEventListener.mock.calls[0][0] as PieceDropEvent
    ).detail;

    expect(from).toBe('e2');
    expect(to).toBe('e4');

    expect(piece!.classList.contains('dragging')).toBe(false);
  });

  test('drag piece back to origin square', () => {
    const mockPieceClick = vi.fn();
    board.addEventListener('piececlick', mockPieceClick);

    const initialPiecesCount =
      piecesContainer.querySelectorAll('cb-piece').length;

    const e2Square = getSquareCoordinates('e2', SQUARE_SIZE, 'white');
    const e4Square = getSquareCoordinates('e4', SQUARE_SIZE, 'white');

    piecesContainer.dispatchEvent(
      new MouseEvent('mousedown', {
        clientX: e2Square.x,
        clientY: e2Square.y,
      }),
    );
    document.dispatchEvent(
      new MouseEvent('mousemove', {
        clientX: e2Square.x,
        clientY: e4Square.y,
      }),
    );

    const piece = piecesContainer.querySelector('#wp5');

    expect(piece!.classList.contains('dragging')).toBe(true);

    document.dispatchEvent(
      new MouseEvent('mouseup', {
        clientX: e2Square.x,
        clientY: e2Square.y,
      }),
    );

    expect(mockPieceClick).toHaveBeenCalledTimes(1);
    expect(mockPieceClick.mock.calls[0][0].detail.square).toBe('e2');
    expect(piecesContainer.querySelectorAll('cb-piece').length).toBe(
      initialPiecesCount,
    );
  });
});

describe('Chessboard transitions', () => {
  let board: Chessboard;
  let piecesContainer: HTMLDivElement;

  beforeEach(() => {
    board = document.createElement(CUSTOM_ELEMENT_NAME) as Chessboard;
    document.body.appendChild(board);

    piecesContainer = board.shadowRoot?.querySelector(
      'cb-pieces',
    ) as HTMLDivElement;
  });

  afterEach(() => {
    document.body.removeChild(board);
  });

  test('setting fen should animate moving of pieces', () => {
    const mockTransitionEnd = vi.fn();
    board.addEventListener('transitionend', mockTransitionEnd);
    const piece = piecesContainer.querySelector('#wp5')!;

    expect(piece.classList.contains('moving')).toBe(false);

    board.fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';

    expect(piece.classList.contains('moving')).toBe(true);

    // we need to dispatch transitionend manually because JSDOM does not trigger it
    piece.dispatchEvent(new Event('transitionend'));
    board.dispatchEvent(new Event('transitionend'));

    expect(mockTransitionEnd).toHaveBeenCalledTimes(1);
  });
});
