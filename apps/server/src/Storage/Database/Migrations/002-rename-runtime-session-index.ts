import type { DatabaseMigration } from "../migration.js";

export const renameRuntimeSessionIndexMigration: DatabaseMigration = {
  version: 2,
  name: "rename_runtime_session_index",
  up(database) {
    database.exec(`
      DROP INDEX runtime_session_session_id_idx;
      CREATE UNIQUE INDEX runtime_session_session_id_uidx
        ON runtime_session(session_id);
    `);
  },
};
