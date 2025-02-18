import { defineConfig } from "vite";

const root = './src';
const srcFile = `${root}/index`;

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    lib: {
      entry: srcFile,
      name: "neurosys",
      formats: [ "es", "cjs" ],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    }
  },
});
