import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    lib: {
      entry: {
        main: resolve(__dirname, 'src', 'core'),
        plugins: resolve(__dirname, 'src', 'plugins'),
        config: resolve(__dirname, 'src', 'core', 'commoners', 'config'),
        services: resolve(__dirname, 'src', 'services'),
        ["services/volume"]: resolve(__dirname, 'src', 'services', 'volume'),
      },
      name: 'neurosys',
      formats: ['es', 'cjs'],
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'cjs'}`,
    },
    rollupOptions: { 
      external: [ 
        'loudness', // Cannot be bundled well
        "node:http" // Native module
      ] }
  },
});
