import type { DatabaseSync } from "node:sqlite";
import type { SyncConversationDto } from "@pi/shared";
import type { ConversationEntity, ConversationStatus } from "../Entity/conversation-entity.js";

const COLUMNS = `SELECT id, project_id, pi_session_id, session_file, title, status, is_pinned, pinned_at, archived_at,
  unread_count, last_message_at, last_opened_at, created_at, updated_at FROM conversation`;

export class ConversationMapper {
  constructor(private readonly database: DatabaseSync) {}
  upsert(input: SyncConversationDto): ConversationEntity {
    const now = Date.now();
    this.database
      .prepare(
        `INSERT INTO conversation (id, project_id, pi_session_id, session_file, title, status, is_pinned, unread_count,
      last_message_at, last_opened_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET project_id = excluded.project_id, pi_session_id = excluded.pi_session_id,
      session_file = excluded.session_file, title = excluded.title, status = excluded.status,
      last_message_at = excluded.last_message_at, updated_at = excluded.updated_at`,
      )
      .run(input.id, input.projectId, input.piSessionId, input.sessionFile ?? null, input.title, input.status, now, now, now, now);
    return this.findById(input.id)!;
  }
  findById(id: string): ConversationEntity | undefined {
    const row = this.database.prepare(`${COLUMNS} WHERE id = ?`).get(id);
    return row ? mapConversation(row) : undefined;
  }
  findByProject(projectId: string, limit: number, offset = 0): ConversationEntity[] {
    return this.database
      .prepare(`${COLUMNS} WHERE project_id = ? AND archived_at IS NULL ORDER BY last_message_at DESC, id DESC LIMIT ? OFFSET ?`)
      .all(projectId, limit, offset)
      .map(mapConversation);
  }
  countByProject(projectId: string): number {
    return Number(
      this.database.prepare("SELECT COUNT(*) AS count FROM conversation WHERE project_id = ? AND archived_at IS NULL").get(projectId)
        ?.count ?? 0,
    );
  }
  findPinned(limit = 20): ConversationEntity[] {
    return this.database
      .prepare(`${COLUMNS} WHERE is_pinned = 1 AND archived_at IS NULL ORDER BY pinned_at DESC, id DESC LIMIT ?`)
      .all(limit)
      .map(mapConversation);
  }
  findRecent(limit = 20): ConversationEntity[] {
    return this.database
      .prepare(`${COLUMNS} WHERE archived_at IS NULL ORDER BY last_message_at DESC, id DESC LIMIT ?`)
      .all(limit)
      .map(mapConversation);
  }
  setPinned(id: string, pinned: boolean): boolean {
    const now = Date.now();
    return (
      this.database
        .prepare("UPDATE conversation SET is_pinned = ?, pinned_at = ?, updated_at = ? WHERE id = ?")
        .run(pinned ? 1 : 0, pinned ? now : null, now, id).changes > 0
    );
  }
  archive(id: string): boolean {
    const now = Date.now();
    return (
      this.database
        .prepare("UPDATE conversation SET archived_at = ?, is_pinned = 0, pinned_at = NULL, updated_at = ? WHERE id = ?")
        .run(now, now, id).changes > 0
    );
  }
  markRead(id: string): boolean {
    return (
      this.database
        .prepare("UPDATE conversation SET unread_count = 0, last_opened_at = ?, updated_at = ? WHERE id = ?")
        .run(Date.now(), Date.now(), id).changes > 0
    );
  }
  deleteByProject(projectId: string): number {
    return Number(this.database.prepare("DELETE FROM conversation WHERE project_id = ?").run(projectId).changes);
  }
}

function mapConversation(row: Record<string, unknown>): ConversationEntity {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    piSessionId: String(row.pi_session_id),
    sessionFile: row.session_file === null ? null : String(row.session_file),
    title: String(row.title),
    status: String(row.status) as ConversationStatus,
    isPinned: Number(row.is_pinned) === 1,
    pinnedAt: row.pinned_at === null ? null : Number(row.pinned_at),
    archivedAt: row.archived_at === null ? null : Number(row.archived_at),
    unreadCount: Number(row.unread_count),
    lastMessageAt: row.last_message_at === null ? null : Number(row.last_message_at),
    lastOpenedAt: row.last_opened_at === null ? null : Number(row.last_opened_at),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}
