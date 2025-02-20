import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'src', 'index'),
        config: resolve(__dirname, 'src', 'commoners', 'config'),
        plugins: resolve(__dirname, 'src', 'plugins'),
      },
      name: 'neurosys',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`
    }
  },
});
