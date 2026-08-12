import type { DatabaseSync } from "node:sqlite";

export interface DatabaseMigration {
  version: number;
  name: string;
  up(database: DatabaseSync): void;
}

export function migrateDatabase(database: DatabaseSync, migrations: DatabaseMigration[]): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_migration (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER NOT NULL
    );
  `);

  const applied = new Map(
    database
      .prepare("SELECT version, name FROM schema_migration")
      .all()
      .map((row) => [Number(row.version), String(row.name)]),
  );

  for (const migration of [...migrations].sort((left, right) => left.version - right.version)) {
    const appliedName = applied.get(migration.version);
    if (appliedName !== undefined) {
      if (appliedName !== migration.name)
        throw new Error(`Migration ${migration.version} name mismatch: ${appliedName} != ${migration.name}`);
      continue;
    }

    database.exec("BEGIN IMMEDIATE");
    try {
      migration.up(database);
      database
        .prepare("INSERT INTO schema_migration (version, name, applied_at) VALUES (?, ?, ?)")
        .run(migration.version, migration.name, Date.now());
      database.exec("COMMIT");
    } catch (error) {
      database.exec("ROLLBACK");
      throw error;
    }
  }
}
