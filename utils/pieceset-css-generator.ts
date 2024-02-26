import { readFileSync, writeFileSync } from 'fs';
import { CUSTOM_ELEMENT_NAME } from '../src/constants';

const pieceset = process.argv[2];
const folderPath = process.argv[3];

const cssRules = [];
for (const color of ['white', 'black']) {
  for (const type of ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king']) {
    const base64 = readFileSync(`${folderPath}/${color}${type}.svg`, 'base64');
    cssRules.push(
      `${CUSTOM_ELEMENT_NAME}::part(${color} ${type}) {\n  background-image: url(data:image/svg+xml;base64,${base64});\n}`,
    );
  }
}

writeFileSync(`${pieceset}.css`, cssRules.join('\n\n'));
