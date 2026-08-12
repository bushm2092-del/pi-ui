import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { initializePiUiHome, resolvePiUiHome } from "../src/Storage/pi-ui-home.js";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("Pi UI home", () => {
  it("creates the cross-platform directory structure and built-in config", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-home-"));
    directories.push(directory);

    const paths = await initializePiUiHome(join(directory, ".pi-ui"));
    expect(paths).toEqual(resolvePiUiHome(join(directory, ".pi-ui")));
    expect(JSON.parse(await readFile(paths.configFile, "utf8"))).toEqual({
      version: 1,
      database: "Database/pi-ui.sqlite",
      sessions: "Sessions",
      logs: "Logs",
      cache: "Cache",
    });
  });

  it("does not overwrite an existing config", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-home-"));
    directories.push(directory);
    const paths = await initializePiUiHome(directory);
    await writeFile(paths.configFile, '{"custom":true}\n', "utf8");

    await initializePiUiHome(directory);

    expect(await readFile(paths.configFile, "utf8")).toBe('{"custom":true}\n');
  });
});
