import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SqliteRuntimeMapper } from "../src/Mapper/sqlite-runtime-mapper.js";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("SqliteRuntimeMapper", () => {
  it("persists, updates and deletes runtime metadata", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-sqlite-"));
    directories.push(directory);
    const mapper = new SqliteRuntimeMapper(join(directory, "test.sqlite"));
    const runtime = {
      runtimeSlotId: "slot-1",
      state: "ready" as const,
      cwd: directory,
      sessionId: "session-1",
      isStreaming: false,
      thinkingLevel: "off",
      messages: [],
      diagnostics: [],
    };
    mapper.save(runtime);
    expect(mapper.findById("slot-1")).toMatchObject({ sessionId: "session-1", state: "ready" });
    mapper.save({ ...runtime, sessionName: "Renamed" });
    expect(mapper.findAll()).toHaveLength(1);
    expect(mapper.findById("slot-1")?.sessionName).toBe("Renamed");
    expect(mapper.delete("slot-1")).toBe(true);
    expect(mapper.findById("slot-1")).toBeUndefined();
    mapper.close();
  });
});
