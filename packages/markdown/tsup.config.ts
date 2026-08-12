import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    "code/index": "src/code/index.ts",
    "extensions/index": "src/extensions/index.ts",
    index: "src/index.ts",
    "math/index": "src/math/index.ts",
    "mermaid/index": "src/mermaid/index.ts",
    "plugins/index": "src/plugins/index.ts",
    "renderers/index": "src/renderers/index.ts",
    "runtime/preset": "src/runtime/preset.ts",
    "table/index": "src/table/index.ts",
  },
  format: ["esm"],
  splitting: true,
  sourcemap: true,
  target: "es2022",
});
