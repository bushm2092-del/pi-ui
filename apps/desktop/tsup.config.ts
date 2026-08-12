import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: { index: "src/main/index.ts" },
    format: ["esm"],
    platform: "node",
    target: "node22",
    outDir: "out/main",
    noExternal: ["@pi/shared"],
    external: ["electron", "@pi/server/runtime"]
  },
  {
    entry: { index: "src/preload/index.ts" },
    format: ["cjs"],
    platform: "node",
    target: "node22",
    outDir: "out/preload",
    outExtension: () => ({ js: ".cjs" }),
    external: ["electron"]
  }
]);
