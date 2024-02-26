# Chessboard [![Continuous integration](https://img.shields.io/github/actions/workflow/status/moterink/chessboard/ci.yaml?label=CI&logo=github)](https://github.com/moterink/chessboard/actions/workflows/ci.yaml?query=branch%3Amain) [![NPM Version](https://img.shields.io/npm/v/%40chess-components%2Fboard?logo=npm)](https://www.npmjs.com/package/@chess-components/board)

`@chess-components/board` is a lightweight chessboard [web component](https://developer.mozilla.org/en-US/docs/Web/API/Web_components), designed for integrating chessboards seamlessly into your web applications.

## Usage

To start using the chessboard component, follow these steps:

1. Install the package using npm:

   ```bash
   npm install @chess-components/board
   ```

2. Include the necessary script tag in your HTML file to import the module:

   ```html
   <script type="module" src="node_modules/@chess-components/board"></script>
   ```

3. Add default styles to your HTML file to ensure the board is properly displayed:

   ```html
   <link
     rel="stylesheet"
     href="node_modules/@chess-components/board/dist/assets/backgrounds/brown.css"
   />
   <link
     rel="stylesheet"
     href="node_modules/@chess-components/board/dist/assets/piecesets/cburnett.css"
   />
   ```

   These stylesheets provide default backgrounds and piece sets for the chessboard.

4. Place the chessboard element within your HTML where you want it to appear:

   ```html
   <chess-board></chess-board>
   ```

## Notes

`@chess-components/board` provides the fundamental structure for a chessboard, serving as a solid foundation for creating chess games or editors.
