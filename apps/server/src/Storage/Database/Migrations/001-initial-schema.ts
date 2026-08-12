import type { DatabaseMigration } from "../migration.js";

export const initialSchemaMigration: DatabaseMigration = {
  version: 1,
  name: "initial_schema",
  up(database) {
    database.exec(`
      CREATE TABLE runtime_session (
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

      CREATE UNIQUE INDEX runtime_session_session_id_idx
        ON runtime_session(session_id);
    `);
  },
};
