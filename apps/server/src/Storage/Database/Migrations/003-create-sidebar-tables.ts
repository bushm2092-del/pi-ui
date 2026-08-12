import type { DatabaseMigration } from "../migration.js";

/**
 * Creates the persistent source of truth for the sidebar.
 *
 * There are deliberately no foreign keys. Project/conversation consistency and
 * delete ordering belong to Service transactions, as required by the SQL guide.
 */
export const createSidebarTablesMigration: DatabaseMigration = {
  version: 3,
  name: "create_sidebar_tables",
  up(database) {
    database.exec(`
      -- One row represents one local workspace shown in the Project section.
      CREATE TABLE project (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cwd TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_muted INTEGER NOT NULL DEFAULT 0 CHECK (is_muted IN (0, 1)),
        can_create_conversation INTEGER NOT NULL DEFAULT 1 CHECK (can_create_conversation IN (0, 1)),
        last_opened_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE UNIQUE INDEX project_cwd_uidx ON project(cwd);
      CREATE INDEX project_sort_order_idx ON project(sort_order, last_opened_at, id);

      -- Conversation stores sidebar metadata only. Full messages remain in the Pi session JSONL.
      CREATE TABLE conversation (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        pi_session_id TEXT NOT NULL,
        session_file TEXT,
        title TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'running', 'failed')),
        is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
        pinned_at INTEGER,
        archived_at INTEGER,
        unread_count INTEGER NOT NULL DEFAULT 0 CHECK (unread_count >= 0),
        last_message_at INTEGER,
        last_opened_at INTEGER,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE UNIQUE INDEX conversation_pi_session_id_uidx ON conversation(pi_session_id);
      CREATE UNIQUE INDEX conversation_session_file_uidx ON conversation(session_file) WHERE session_file IS NOT NULL;

      -- Project children: supports the default limited list and the Show More pagination action.
      CREATE INDEX conversation_project_recent_idx
        ON conversation(project_id, archived_at, last_message_at DESC, id DESC);

      -- Pinned and Recent are query views over conversation, not separate tables.
      CREATE INDEX conversation_pinned_idx
        ON conversation(is_pinned, archived_at, pinned_at DESC, id DESC);
      CREATE INDEX conversation_recent_idx
        ON conversation(archived_at, last_message_at DESC, id DESC);
    `);
  },
};
