import {
  type Color,
  type Square,
  ActiveColor,
  ObservedAttribute,
} from './types';
import { Drawings, calculateArrowCoordinates } from './drawings';
import { BoardCoordinates } from './coordinates';
import { Pieces } from './pieces';
import { checkArgumentValueValid } from './errors';
import { CUSTOM_ELEMENT_NAME, OBSERVED_ATTRIBUTES } from './constants';

import styles from './styles/board.css?inline';

import './drawings';
import './coordinates';
import './pieces';

customElements.define('cb-layers', class extends HTMLElement {});
customElements.define(
  'cb-background',
  class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.part.add('background');
    }
  },
);

export class Chessboard extends HTMLElement {
  static observedAttributes = OBSERVED_ATTRIBUTES;

  private layersElement = document.createElement('cb-layers');
  private backgroundElement = document.createElement('cb-background');
  private piecesElement = document.createElement('cb-pieces') as Pieces;
  private drawingsElement = document.createElement('cb-drawings') as Drawings;
  private coordinatesElement = document.createElement(
    'cb-coordinates',
  ) as BoardCoordinates;
  private pieceStylesheetLinkElement = document.createElement('link');

  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.showCoordinates) {
      this.coordinatesElement.visible = false;
    }

    if (!this.orientation) {
      this.setAttribute('orientation', 'white');
    }

    if (!this.active) {
      this.setAttribute('active', 'both');
    }

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;

    this.piecesElement.orientation = this.orientation;

    this.layersElement.appendChild(this.backgroundElement);
    this.layersElement.appendChild(this.coordinatesElement);
    this.layersElement.appendChild(this.drawingsElement);
    this.layersElement.appendChild(this.piecesElement);

    this.pieceStylesheetLinkElement.setAttribute('rel', 'stylesheet');

    const shadow = this.attachShadow({ mode: 'closed' });
    shadow.appendChild(styleElement);
    shadow.appendChild(this.layersElement);
  }

  attributeChangedCallback(
    name: ObservedAttribute,
    oldValue: string,
    newValue: string,
  ) {
    checkArgumentValueValid(name, newValue);
    switch (name) {
      case 'active':
        this.piecesElement.active = newValue as ActiveColor;
        break;
      case 'size':
        this.style.width = `round(to-zero, ${newValue}, 8px)`;
        break;
      case 'show-coordinates':
        this.coordinatesElement.visible = newValue !== null;
        break;
      case 'fen':
        this.fen = newValue;
        break;
      case 'orientation':
        if (oldValue !== null && oldValue !== newValue) {
          this.piecesElement.orientation = newValue as Color;
          this.drawingsElement.mirror();
        }
        break;
    }
  }

  get active(): ActiveColor {
    return this.getAttribute('active') as ActiveColor;
  }

  set active(value: ActiveColor) {
    this.setAttribute('active', value as string);
  }

  set fen(fen: string) {
    this.piecesElement.fen = fen;
  }

  get orientation() {
    return this.getAttribute('orientation') as Color;
  }

  get showCoordinates() {
    return this.getAttribute('show-coordinates') !== null;
  }

  get enableAnimations(): boolean {
    return this.piecesElement.enableAnimations;
  }

  set enableAnimations(value: boolean) {
    this.piecesElement.enableAnimations = value;
  }

  move(from: Square, to: Square, immediate?: boolean): void {
    this.piecesElement.movePiece(from, to, immediate);
  }

  highlightSquare(square: Square, color = 'yellow') {
    return this.drawingsElement.addSquareHighlight(
      square,
      this.orientation,
      color,
    );
  }

  clearSquareHighlights() {
    this.drawingsElement.removeAll();
  }

  drawArrow(from: Square, to: Square, color = 'blue') {
    const [fromCoordinates, toCoordinates] = calculateArrowCoordinates(
      from,
      to,
      this.orientation,
    );
    return this.drawingsElement.addArrow(fromCoordinates, toCoordinates, color);
  }
}

customElements.define(CUSTOM_ELEMENT_NAME, Chessboard);
