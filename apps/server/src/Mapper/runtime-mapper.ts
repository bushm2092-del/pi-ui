import type { RuntimeSnapshotDto } from "@pi/shared";
import type { DatabaseSync } from "node:sqlite";
import type { RuntimeEntity } from "../Entity/runtime-entity.js";

export class RuntimeMapper {
  constructor(private readonly database: DatabaseSync) {}

  save(runtime: RuntimeSnapshotDto): RuntimeEntity {
    const now = Date.now();
    this.database
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
    const row = this.database.prepare(`${RUNTIME_COLUMNS} WHERE runtime_slot_id = ?`).get(runtimeSlotId);
    return row ? mapRow(row) : undefined;
  }

  findAll(): RuntimeEntity[] {
    return this.database.prepare(`${RUNTIME_COLUMNS} ORDER BY updated_at DESC, runtime_slot_id DESC`).all().map(mapRow);
  }

  delete(runtimeSlotId: string): boolean {
    return this.database.prepare("DELETE FROM runtime_session WHERE runtime_slot_id = ?").run(runtimeSlotId).changes > 0;
  }
}

const RUNTIME_COLUMNS = `
  SELECT
    runtime_slot_id,
    session_id,
    cwd,
    session_file,
    session_name,
    provider,
    model_id,
    state,
    created_at,
    updated_at
  FROM runtime_session
`;

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
