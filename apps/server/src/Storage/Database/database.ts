import { DatabaseSync } from "node:sqlite";
import { migrateDatabase } from "./migration.js";
import { initialSchemaMigration } from "./Migrations/001-initial-schema.js";
import { renameRuntimeSessionIndexMigration } from "./Migrations/002-rename-runtime-session-index.js";
import { createSidebarTablesMigration } from "./Migrations/003-create-sidebar-tables.js";
import { removeProjectFlagsMigration } from "./Migrations/004-remove-project-flags.js";
import { removeRuntimeStateMigration } from "./Migrations/005-remove-runtime-state.js";

export class PiUiDatabase {
  readonly connection: DatabaseSync;

  constructor(path: string) {
    this.connection = new DatabaseSync(path);
    this.connection.exec("PRAGMA journal_mode = WAL;");
    migrateDatabase(this.connection, [
      initialSchemaMigration,
      renameRuntimeSessionIndexMigration,
      createSidebarTablesMigration,
      removeProjectFlagsMigration,
      removeRuntimeStateMigration,
    ]);
  }

  close(): void {
    this.connection.close();
  }
}
