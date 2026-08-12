import { DatabaseSync } from "node:sqlite";
import type { RuntimeSnapshotDto } from "@pi/shared";
import type { RuntimeEntity } from "../Entity/runtime-entity.js";
import type { RuntimeMapper } from "./runtime-mapper.js";

export class SqliteRuntimeMapper implements RuntimeMapper {
  readonly #database: DatabaseSync;

  constructor(path: string) {
    this.#database = new DatabaseSync(path);
    this.#database.exec(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;
      CREATE TABLE IF NOT EXISTS runtime_session (
        runtime_slot_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        cwd TEXT NOT NULL,
        session_file TEXT,
        session_name TEXT,
        provider TEXT,
        model_id TEXT,
        state TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );
      CREATE UNIQUE INDEX IF NOT EXISTS runtime_session_session_id_idx
        ON runtime_session(session_id);
    `);
  }

  save(runtime: RuntimeSnapshotDto): RuntimeEntity {
    const now = Date.now();
    this.#database
      .prepare(
        `
      INSERT INTO runtime_session (
        runtime_slot_id, session_id, cwd, session_file, session_name,
        provider, model_id, state, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(runtime_slot_id) DO UPDATE SET
        session_id = excluded.session_id,
        cwd = excluded.cwd,
        session_file = excluded.session_file,
        session_name = excluded.session_name,
        provider = excluded.provider,
        model_id = excluded.model_id,
        state = excluded.state,
        updated_at = excluded.updated_at
    `,
      )
      .run(
        runtime.runtimeSlotId,
        runtime.sessionId,
        runtime.cwd,
        runtime.sessionFile ?? null,
        runtime.sessionName ?? null,
        runtime.model?.provider ?? null,
        runtime.model?.id ?? null,
        runtime.state,
        now,
        now,
      );
    return this.findById(runtime.runtimeSlotId)!;
  }

  findById(runtimeSlotId: string): RuntimeEntity | undefined {
    const row = this.#database.prepare("SELECT * FROM runtime_session WHERE runtime_slot_id = ?").get(runtimeSlotId);
    return row ? mapRow(row) : undefined;
  }

  findAll(): RuntimeEntity[] {
    return this.#database.prepare("SELECT * FROM runtime_session ORDER BY updated_at DESC").all().map(mapRow);
  }

  delete(runtimeSlotId: string): boolean {
    return this.#database.prepare("DELETE FROM runtime_session WHERE runtime_slot_id = ?").run(runtimeSlotId).changes > 0;
  }

  close(): void {
    this.#database.close();
  }
}

function mapRow(row: Record<string, unknown>): RuntimeEntity {
  return {
    runtimeSlotId: String(row.runtime_slot_id),
    sessionId: String(row.session_id),
    cwd: String(row.cwd),
    sessionFile: row.session_file === null ? null : String(row.session_file),
    sessionName: row.session_name === null ? null : String(row.session_name),
    provider: row.provider === null ? null : String(row.provider),
    modelId: row.model_id === null ? null : String(row.model_id),
    state: String(row.state),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}
