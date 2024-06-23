/// <reference types="vitest" />
import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'chessboard',
      fileName: 'chessboard',
    },
  },
  test: {
    setupFiles: 'tests/setup.ts',
    environment: 'jsdom',
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov']
    },
  },
});
