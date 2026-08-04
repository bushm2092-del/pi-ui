import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { JsonlOperationJournal } from "../src/index.js";

const tempDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("JsonlOperationJournal", () => {
  it("marks an interrupted running operation as uncertain on recovery", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-journal-"));
    tempDirectories.push(directory);
    const path = join(directory, "operations.jsonl");
    const first = new JsonlOperationJournal(path);
    await first.initialize();
    await first.accept("operation-1", "slot-1", "runtime.prompt");
    await first.transition("operation-1", "running");

    const recovered = new JsonlOperationJournal(path);
    await recovered.initialize();

    expect(recovered.get("operation-1")?.status).toBe("uncertain");
    expect(recovered.get("operation-1")?.error?.code).toBe("process_interrupted");
  });

  it("rejects transitions from a terminal state", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-journal-"));
    tempDirectories.push(directory);
    const journal = new JsonlOperationJournal(join(directory, "operations.jsonl"));
    await journal.initialize();
    await journal.accept("operation-1", "slot-1", "runtime.prompt");
    await journal.transition("operation-1", "running");
    await journal.transition("operation-1", "completed");

    await expect(journal.transition("operation-1", "failed")).rejects.toThrow("Invalid operation transition");
  });
});
