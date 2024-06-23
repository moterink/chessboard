import { FILES, RANKS } from './constants';

customElements.define('cb-coordinates-ranks', class extends HTMLElement {});
customElements.define('cb-coordinates-files', class extends HTMLElement {});
customElements.define('cb-coordinate', class extends HTMLElement {});

export class BoardCoordinates extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const ranksElement = document.createElement('cb-coordinates-ranks');
    const filesElement = document.createElement('cb-coordinates-files');

    for (const [symbolSource, element] of [
      [RANKS, ranksElement],
      [FILES, filesElement],
    ] as [[typeof RANKS, HTMLElement], [typeof FILES, HTMLElement]]) {
      symbolSource.forEach((c) => {
        const coordinate = document.createElement('cb-coordinate');
        coordinate.innerText = c;
        element.appendChild(coordinate);
      });
    }

    this.appendChild(ranksElement);
    this.appendChild(filesElement);

    this.part.add('coordinates');
  }

  set visible(value: boolean) {
    this.style.visibility = value ? 'visible' : 'hidden';
  }
}

customElements.define('cb-coordinates', BoardCoordinates);
