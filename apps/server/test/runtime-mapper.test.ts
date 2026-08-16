import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { RuntimeMapper } from "../src/Mapper/runtime-mapper.js";
import { PiUiDatabase } from "../src/Storage/Database/database.js";

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("RuntimeMapper", () => {
  it("persists, updates and deletes runtime metadata", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-sqlite-"));
    directories.push(directory);
    const database = new PiUiDatabase(join(directory, "test.sqlite"));
    const mapper = new RuntimeMapper(database.connection);
    const runtime = {
      runtimeSlotId: "slot-1",
      cwd: directory,
      sessionId: "session-1",
      isStreaming: false,
      isIdle: true,
      isCompacting: false,
      retryAttempt: 0,
      thinkingLevel: "off",
      messages: [],
      diagnostics: [],
    };
    mapper.save(runtime);
    expect(mapper.findById("slot-1")).toMatchObject({ sessionId: "session-1" });
    mapper.save({ ...runtime, sessionName: "Renamed" });
    expect(mapper.findAll()).toHaveLength(1);
    expect(mapper.findById("slot-1")?.sessionName).toBe("Renamed");
    expect(mapper.delete("slot-1")).toBe(true);
    expect(mapper.findById("slot-1")).toBeUndefined();
    database.close();
  });
});
