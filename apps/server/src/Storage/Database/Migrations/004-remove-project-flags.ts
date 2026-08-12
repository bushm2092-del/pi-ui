import type { DatabaseMigration } from "../migration.js";

/** Removes project flags that are UI concerns rather than persisted project data. */
export const removeProjectFlagsMigration: DatabaseMigration = {
  version: 4,
  name: "remove_project_flags",
  up(database) {
    database.exec(`
      ALTER TABLE project DROP COLUMN is_muted;
      ALTER TABLE project DROP COLUMN can_create_conversation;
    `);
  },
};
