import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

export default defineConfig({
  plugins: [react(), svgr(), tailwindcss()],
  server: { host: "127.0.0.1", port: 5173, strictPort: true },
  build: { outDir: "dist" }
});
