import { writeFileSync } from 'fs';
import { CUSTOM_ELEMENT_NAME } from '../src/constants';

const name = process.argv[2];
const lightColor = process.argv[3];
const darkColor = process.argv[4];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">
  <defs>
    <pattern id="chessboard" patternUnits="userSpaceOnUse" width="2" height="2">
      <g>
        <rect width="1" height="1" fill="${lightColor}" />
        <rect x="1" width="1" height="1" fill="${darkColor}" />
      </g>
      <g transform="translate(0, 1)">
        <rect width="1" height="1" fill="${darkColor}" />
        <rect x="1" width="1" height="1" fill="${lightColor}" />
      </g>
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#chessboard)" />
</svg>`;

const content = `${CUSTOM_ELEMENT_NAME}::part(background) {
  background-image: url(data:image/svg+xml;base64,${btoa(svg)});
}

${CUSTOM_ELEMENT_NAME}::part(coordinates) {
  --light-color: ${lightColor};
  --dark-color: ${darkColor};
}
`;

writeFileSync(`${name}.css`, content);
