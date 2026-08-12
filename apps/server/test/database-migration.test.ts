import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { PiUiDatabase } from "../src/Storage/Database/database.js";

const directories: string[] = [];

afterEach(async () => {
  await Promise.all(directories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("database migrations", () => {
  it("applies the initial schema once and records its version", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-migration-"));
    directories.push(directory);
    const path = join(directory, "test.sqlite");

    const first = new PiUiDatabase(path);
    expect(first.connection.prepare("SELECT version, name FROM schema_migration ORDER BY version").all()).toEqual([
      { version: 1, name: "initial_schema" },
      { version: 2, name: "rename_runtime_session_index" },
    ]);
    first.close();

    const reopened = new PiUiDatabase(path);
    expect(reopened.connection.prepare("SELECT COUNT(*) AS count FROM schema_migration").get()).toEqual({ count: 2 });
    reopened.close();
  });
});
