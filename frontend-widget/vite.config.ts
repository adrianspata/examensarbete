// frontend-widget/vite.config.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "PPFEWidget",
      fileName: "ppfe-widget",
      formats: ["iife"], // en self-executing bundle
    },
    rollupOptions: {
      output: {
        globals: {
          // inga externa globals – allt bundlas
        },
      },
    },
  },
});
