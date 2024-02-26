import { getRelativeFileRank } from './squares';
import { Color, Coordinates, Square } from './types';

const SVGNamespaceURI = 'http://www.w3.org/2000/svg';

export const calculateArrowCoordinates = (
  from: Square,
  to: Square,
  orientation: Color,
): [Coordinates, Coordinates] => {
  const fromIndices = getRelativeFileRank(from, orientation);
  const toIndices = getRelativeFileRank(to, orientation);

  return [
    { x: fromIndices.file, y: fromIndices.rank },
    { x: toIndices.file, y: toIndices.rank },
  ];
};

const mirrorValue = (value: number) => Math.abs(Math.floor(value) - 7);

const ARROW_OPACITY = '0.5';
const SQUARE_HIGHLIGHT_OPACITY = '0.8';

// NOTE: it's important to export Arrow and SquareHighlight, otherwise Typescript
// cannot generate declarations because the class is treated as anonymous.
// More info here: https://github.com/microsoft/TypeScript/issues/30355

export class Arrow {
  private _from: Coordinates = { x: 0, y: 0 };
  private _to: Coordinates = { x: 0, y: 0 };
  private _color = 'blue';

  private _element: SVGGElement;
  private _headElement: SVGMarkerElement;
  private _lineElement: SVGLineElement;

  private _onRemove: () => void;

  constructor(
    from: Coordinates,
    to: Coordinates,
    color: string,
    defsElement: SVGDefsElement,
    onRemove: () => void,
  ) {
    this._onRemove = onRemove;

    this._headElement = document.createElementNS(SVGNamespaceURI, 'marker');
    this._headElement.id = `arrow-head-${this.color}`;
    this._headElement.setAttribute('orient', 'auto');
    this._headElement.setAttribute('markerWidth', '5');
    this._headElement.setAttribute('markerHeight', '5');
    this._headElement.setAttribute('refX', '1.5');
    this._headElement.setAttribute('refY', '1.5');
    this._headElement.setAttribute('fill', color);

    const useElement = document.createElementNS(SVGNamespaceURI, 'use');
    useElement.setAttribute('href', `#arrow-path`);

    this._headElement.appendChild(useElement);

    // Unfortunately, we have to create a marker element for each color.
    // This will be improved once browsers support context-fill/context-stroke
    // https://stackoverflow.com/questions/16664584/changing-an-svg-markers-color-css#16665510
    defsElement.appendChild(this._headElement);

    this._lineElement = document.createElementNS(SVGNamespaceURI, 'line');
    this._lineElement.setAttribute(
      'marker-end',
      `url(#${this._headElement.id})`,
    );
    this._lineElement.setAttribute('stroke-width', '0.2');
    this._lineElement.setAttribute('stroke-linecap', 'round');

    this._element = document.createElementNS(SVGNamespaceURI, 'g');
    this._element.setAttribute('opacity', ARROW_OPACITY);
    this._element.appendChild(this._lineElement);

    this.from = from;
    this.to = to;
    this.color = color;
  }

  set from(value: Coordinates) {
    this._from = value;
    this._lineElement.setAttribute('x1', (this.from.x + 0.5).toString());
    this._lineElement.setAttribute('y1', (this.from.y + 0.5).toString());
  }

  set to(value: Coordinates) {
    this._to = value;

    const diff = { x: this.from.x - this.to.x, y: this.from.y - this.to.y };

    const adjust = { x: 0, y: 0 };
    if (diff.x !== 0) {
      adjust.x = 0.35 * (diff.x > 0 ? 1 : -1);
    }
    if (diff.y !== 0) {
      adjust.y = 0.35 * (diff.y > 0 ? 1 : -1);
    }

    this._lineElement.setAttribute(
      'x2',
      (this.to.x + 0.5 + adjust.x).toString(),
    );
    this._lineElement.setAttribute(
      'y2',
      (this.to.y + 0.5 + adjust.y).toString(),
    );
  }

  set color(value: string) {
    this._color = value;
    this._lineElement.setAttribute('stroke', this.color);
  }

  get from() {
    return this._from;
  }

  get to() {
    return this._to;
  }

  get color() {
    return this._color;
  }

  get element() {
    return this._element;
  }

  mirror() {
    this.from = { x: mirrorValue(this.from.x), y: mirrorValue(this.from.y) };
    this.to = { x: mirrorValue(this.to.x), y: mirrorValue(this.to.y) };
  }

  remove() {
    this._onRemove();
  }
}

export class SquareHighlight {
  private _coordinates: Coordinates = { x: 0, y: 0 };
  private _color: string = 'blue';

  private _element: SVGRectElement;

  private _onRemove: () => void;

  constructor(coordinates: Coordinates, color: string, onRemove: () => void) {
    this._onRemove = onRemove;

    this._element = document.createElementNS(SVGNamespaceURI, 'rect');
    this._element.classList.add('square-highlight');
    this._element.setAttribute('width', '1');
    this._element.setAttribute('height', '1');

    this._element.setAttribute('opacity', SQUARE_HIGHLIGHT_OPACITY);

    this.coordinates = coordinates;
    this.color = color;
  }

  get coordinates() {
    return this._coordinates;
  }

  get color() {
    return this._color;
  }

  set coordinates(value: Coordinates) {
    this._coordinates = value;
    this._element.setAttribute('x', this._coordinates.x.toString());
    this._element.setAttribute('y', this._coordinates.y.toString());
  }

  set color(value: string) {
    this._color = value;
    this._element.setAttribute('fill', this.color);
  }

  get element() {
    return this._element;
  }

  mirror() {
    this.coordinates = {
      x: mirrorValue(this.coordinates.x),
      y: mirrorValue(this.coordinates.y),
    };
  }

  remove() {
    this._onRemove();
  }
}

class Arrows extends HTMLElement {
  private readonly svgElement = document.createElementNS(
    SVGNamespaceURI,
    'svg',
  ) as SVGElement;
  private readonly arrowsDefsElement = document.createElementNS(
    SVGNamespaceURI,
    'defs',
  ) as SVGDefsElement;

  private arrows: Arrow[] = [];

  constructor() {
    super();
  }

  connectedCallback() {
    this.svgElement.setAttribute('viewBox', '0 0 8 8');

    const arrowPathElement = document.createElementNS(SVGNamespaceURI, 'path');
    arrowPathElement.id = 'arrow-path';
    arrowPathElement.setAttribute('d', 'M0,0 L0,3 L2.5,1.5 Z');

    this.arrowsDefsElement.appendChild(arrowPathElement);
    this.svgElement.appendChild(this.arrowsDefsElement);

    this.appendChild(this.svgElement);
  }

  add(from: Coordinates, to: Coordinates, color: string) {
    const arrow = new Arrow(from, to, color, this.arrowsDefsElement, () => {
      const index = this.arrows.findIndex((a) => a === arrow);
      this.arrows.splice(index, 1);
      this.svgElement.removeChild(arrow.element);
    });
    this.arrows.push(arrow);
    this.svgElement.appendChild(arrow.element);
    return arrow;
  }

  mirror() {
    this.arrows.forEach((arrow) => arrow.mirror());
  }

  removeAll() {
    this.arrows.forEach((arrow) => arrow.remove());
  }
}

customElements.define('cb-arrows', Arrows);

class SquareHighlights extends HTMLElement {
  private readonly svgElement = document.createElementNS(
    SVGNamespaceURI,
    'svg',
  ) as SVGElement;

  private squareHighlights: Map<Square, SquareHighlight> = new Map();

  constructor() {
    super();
  }

  connectedCallback() {
    this.svgElement.setAttribute('viewBox', '0 0 8 8');

    this.appendChild(this.svgElement);
  }

  add(square: Square, orientation: Color, color = 'yellow') {
    const oldSquareHighlight = this.squareHighlights.get(square);
    if (oldSquareHighlight) {
      oldSquareHighlight.remove();
    }
    const indices = getRelativeFileRank(square, orientation);
    const squareHighlight = new SquareHighlight(
      { x: indices.file, y: indices.rank },
      color,
      () => {
        this.squareHighlights.delete(square);
        this.svgElement.removeChild(squareHighlight.element);
      },
    );
    this.squareHighlights.set(square, squareHighlight);
    this.svgElement.appendChild(squareHighlight.element);
    return squareHighlight;
  }

  mirror() {
    this.squareHighlights.forEach((squareHighlight) =>
      squareHighlight.mirror(),
    );
  }

  removeAll() {
    this.squareHighlights.forEach((squareHighlight) =>
      squareHighlight.remove(),
    );
  }
}

customElements.define('cb-square-highlights', SquareHighlights);

export class Drawings extends HTMLElement {
  private arrowsElement = document.createElement('cb-arrows') as Arrows;
  private squareHighlightsElement = document.createElement(
    'cb-square-highlights',
  ) as SquareHighlights;

  constructor() {
    super();
  }

  connectedCallback() {
    this.appendChild(this.arrowsElement);
    this.appendChild(this.squareHighlightsElement);
  }

  addSquareHighlight(square: Square, orientation: Color, color = 'yellow') {
    return this.squareHighlightsElement.add(square, orientation, color);
  }

  addArrow(from: Coordinates, to: Coordinates, color = 'blue') {
    return this.arrowsElement.add(from, to, color);
  }

  mirror() {
    this.arrowsElement.mirror();
    this.squareHighlightsElement.mirror();
  }

  removeAll() {
    this.arrowsElement.removeAll();
    this.squareHighlightsElement.removeAll();
  }
}

customElements.define('cb-drawings', Drawings);
