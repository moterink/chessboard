import { describe, test, expect } from 'vitest';

import {
  distance,
  getSquareByCoordinates,
  getSquareByIndex,
  getSquareTranslate,
} from '../src/squares';

describe('Squares', () => {
  test('calculate distance between 2 squares', () => {
    expect(distance('a1', 'a1')).toBe(0);
    expect(distance('a1', 'a2')).toBe(1);
    expect(distance('a1', 'a8')).toBe(7);
    expect(distance('e2', 'e3')).toBeLessThan(distance('e2', 'd3'));
  });

  test('get square by index', () => {
    expect(getSquareByIndex(0)).toBe('a8');
    expect(getSquareByIndex(63)).toBe('h1');
  });

  test('get square translate', () => {
    expect(getSquareTranslate('a8', 'white')).toBe('translate3d(0%, 0%, 0px)');
    expect(getSquareTranslate('a8', 'black')).toBe(
      'translate3d(700%, 700%, 0px)',
    );
  });

  test('get square by coordinates', () => {
    expect(getSquareByCoordinates({ x: 0, y: 0 }, 40, 'white')).toBe('a8');
    expect(getSquareByCoordinates({ x: 0, y: 0 }, 40, 'black')).toBe('h1');
    expect(getSquareByCoordinates({ x: 20, y: 20 }, 40, 'white')).toBe('a8');
  });
});
