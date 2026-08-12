import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/main.ts"],
  format: ["esm"],
  target: "node22",
  platform: "node",
  bundle: true,
  clean: true,
  dts: true,
  sourcemap: true,
  noExternal: ["@pi/shared"],
  external: ["node:sqlite", "socket.io"],
  removeNodeProtocol: false,
});
