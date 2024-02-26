import Position from '../src/position';
import Piece from '../src/pieces';

describe('Position', () => {
  test('add new piece', () => {
    const position = Position.fromFen('4k3/p7/8/8/8/8/P7/4K3 w - - 0 1');

    const piece = new Piece();
    piece.color = 'white';
    piece.type = 'pawn';
    position.addPiece(piece, 'b2');

    expect(position.get('b2')).not.toBeNull();
    expect(piece.id).toBe('wp2');
  });

  test('move piece', () => {
    const position = Position.fromFen('4k3/p7/8/8/8/8/P7/4K3 w - - 0 1');

    const piece = position.get('a2');

    position.movePiece('a2', 'a4');

    expect(position.get('a2')).toBeNull();
    expect(position.get('a4')).toBe(piece);
  });

  test('move piece to square with other piece', () => {
    const position = Position.fromFen('4k3/p7/8/8/8/8/P7/4K3 w - - 0 1');

    const piece = position.get('a2');

    const piecesCount = position.piecesCount;

    position.movePiece('a2', 'a7');

    expect(position.get('a2')).toBeNull();
    expect(position.get('a7')).toBe(piece);
    expect(position.piecesCount).toBe(piecesCount - 1);
  });
});

describe('Position transitions', () => {
  test('add single piece to empty board', () => {
    const position = Position.fromFen('8/8/8/8/8/8/8/8');
    const transition = position.calculateTransition('8/8/8/8/8/8/4P3/8');

    expect(transition.addedPieces.size).toBe(1);
    expect(transition.addedPieces.has('e2')).toBe(true);
    expect(transition.addedPieces.get('e2')).toMatchObject({
      color: 'white',
      type: 'pawn',
    });
  });

  test('capture single piece', () => {
    const position = Position.fromFen('4k2r/8/8/8/8/8/8/4K2R w - - 0 1');
    const transition = position.calculateTransition(
      '4k2R/8/8/8/8/8/8/4K3 b - - 0 1',
    );

    expect(transition.movedPieces.size).toBe(1);
    expect(transition.movedPieces.get('h8')).toMatchObject({
      color: 'white',
      type: 'rook',
    });
  });

  test('multiple pieces', () => {
    const position = Position.fromFen('r3k3/4p3/8/8/8/8/4P3/R3K3 w - - 0 1');
    const transition = position.calculateTransition(
      'R2k2n1/8/8/4p3/4P3/8/8/2B2K2 w - - 0 1',
    );

    expect(transition.movedPieces.get('a8')).toMatchObject({
      color: 'white',
      type: 'rook',
    });
    expect(transition.movedPieces.get('f1')).toMatchObject({
      color: 'white',
      type: 'king',
    });
    expect(transition.movedPieces.get('d8')).toMatchObject({
      color: 'black',
      type: 'king',
    });
    expect(transition.movedPieces.get('e4')).toMatchObject({
      color: 'white',
      type: 'pawn',
    });
    expect(transition.movedPieces.get('e5')).toMatchObject({
      color: 'black',
      type: 'pawn',
    });

    expect(transition.removedPieces[0]).toMatchObject({
      color: 'black',
      type: 'rook',
    });

    expect(transition.addedPieces.get('c1')).toMatchObject({
      color: 'white',
      type: 'bishop',
    });
    expect(transition.addedPieces.get('g8')).toMatchObject({
      color: 'black',
      type: 'knight',
    });
  });
});
