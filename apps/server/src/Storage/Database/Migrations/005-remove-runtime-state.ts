import type { DatabaseMigration } from "../migration.js";

/** Removes the derived runtime state from persisted session metadata. */
export const removeRuntimeStateMigration: DatabaseMigration = {
  version: 5,
  name: "remove_runtime_state",
  up(database) {
    database.exec("ALTER TABLE runtime_session DROP COLUMN state;");
  },
};
