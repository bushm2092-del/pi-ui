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
      { version: 3, name: "create_sidebar_tables" },
      { version: 4, name: "remove_project_flags" },
      { version: 5, name: "remove_runtime_state" },
    ]);
    first.close();

    const reopened = new PiUiDatabase(path);
    expect(reopened.connection.prepare("SELECT COUNT(*) AS count FROM schema_migration").get()).toEqual({ count: 5 });
    reopened.close();
  });

  it("removes derived state from persisted runtime metadata", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-runtime-schema-"));
    directories.push(directory);
    const database = new PiUiDatabase(join(directory, "test.sqlite"));

    const columns = database.connection
      .prepare("PRAGMA table_info(runtime_session)")
      .all()
      .map((column) => column.name);
    expect(columns).not.toContain("state");

    database.close();
  });

  it("creates the sidebar tables without database foreign keys", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-sidebar-schema-"));
    directories.push(directory);
    const database = new PiUiDatabase(join(directory, "test.sqlite"));

    const tables = database.connection
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('project', 'conversation') ORDER BY name")
      .all();
    expect(tables).toEqual([{ name: "conversation" }, { name: "project" }]);
    expect(database.connection.prepare("PRAGMA foreign_key_list(project)").all()).toEqual([]);
    expect(database.connection.prepare("PRAGMA foreign_key_list(conversation)").all()).toEqual([]);

    const projectColumns = database.connection
      .prepare("PRAGMA table_info(project)")
      .all()
      .map((column) => column.name);
    expect(projectColumns).toEqual(["id", "name", "cwd", "sort_order", "last_opened_at", "created_at", "updated_at"]);

    const indexes = database.connection
      .prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND tbl_name = 'conversation' AND sql IS NOT NULL ORDER BY name")
      .all();
    expect(indexes).toEqual([
      { name: "conversation_pi_session_id_uidx" },
      { name: "conversation_pinned_idx" },
      { name: "conversation_project_recent_idx" },
      { name: "conversation_recent_idx" },
      { name: "conversation_session_file_uidx" },
    ]);

    database.close();
  });
});
