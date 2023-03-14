import { defineConfig } from "vite"

export default defineConfig({
    build: {
      outDir: "dist",
      emptyOutDir: false,
      rollupOptions: {
        input: {
          main: "src/main.ts",
        },
        output: {
          entryFileNames: "[name].js",
          inlineDynamicImports: true,
          format: "iife",
        },
      },
    },
});
