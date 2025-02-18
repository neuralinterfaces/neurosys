import { defineConfig } from "vite";
import { resolve } from "node:path";

const root = './src';

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'src', 'index'),
        config: resolve(__dirname, 'src', 'commoners', 'config'),
      },
      name: 'neurosys',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`
    }
  },
});
