import { resolve } from "node:path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  main: { plugins: [externalizeDepsPlugin({ exclude: ["@pi/server", "@pi/shared"] })] },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        external: ["electron"],
        output: { format: "cjs", entryFileNames: "[name].js" }
      }
    }
  },
  renderer: {
    resolve: { alias: { "@renderer": resolve("src/renderer") } },
    plugins: [react(), tailwindcss()]
  }
});
