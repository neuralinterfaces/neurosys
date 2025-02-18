import { defineConfig } from "vite";
import pkgJSON from "./package.json" assert { type: "json" };

const root = './src';
const srcFile = `${root}/index`;

export default defineConfig({
  server: {
    open: true,
  },
  build: {
    lib: {
      entry: srcFile,
      name: "neurotique",
      formats: [ "es" ],
      fileName: (format) => `index.${format === "es" ? "mjs" : "cjs"}`,
    }
  },
});
