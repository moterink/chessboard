import { describe, test, expect, beforeEach, afterEach } from 'vitest';

import { Chessboard } from '../src/board';
import { CUSTOM_ELEMENT_NAME } from '../src/constants';

import '../src/board'; // explicit import needed for custom element definitions

describe('Drawings', () => {
  let board: Chessboard;

  beforeEach(() => {
    board = document.createElement(CUSTOM_ELEMENT_NAME) as Chessboard;
    document.body.appendChild(board);
  });

  afterEach(() => {
    document.body.removeChild(board);
  });

  test('add and remove arrow', () => {
    const arrow = board.drawArrow('e2', 'e4');

    let arrows = board.shadowRoot?.querySelectorAll('cb-arrows > svg > g');

    expect(arrows).toHaveLength(1);

    arrow.remove();

    arrows = board.shadowRoot?.querySelectorAll('cb-arrows > svg > g');

    expect(arrows).toHaveLength(0);
  });

  test('add and remove highlighted square', () => {
    const squareHighlight = board.highlightSquare('e2');

    expect(squareHighlight.element.getAttribute('x')).toBe('4');
    expect(squareHighlight.element.getAttribute('y')).toBe('6');

    let squareHighlights = board.shadowRoot?.querySelectorAll(
      'cb-square-highlights > svg > rect',
    );

    expect(squareHighlights).toHaveLength(1);

    squareHighlight.remove();

    squareHighlights = board.shadowRoot?.querySelectorAll(
      'cb-square-highlights > svg > rect',
    );

    expect(squareHighlights).toHaveLength(0);
  });

  test('highlighted square adjusts when switching orientation', () => {
    board.highlightSquare('e2');

    let square = board.shadowRoot?.querySelector(
      '.square-highlight',
    ) as SVGRectElement;

    expect(square).not.toBeNull();

    board.setAttribute('orientation', 'black');

    square = board.shadowRoot?.querySelector(
      '.square-highlight',
    ) as SVGRectElement;

    expect(square.getAttribute('x')).toBe('3');
    expect(square.getAttribute('y')).toBe('1');
  });
});
