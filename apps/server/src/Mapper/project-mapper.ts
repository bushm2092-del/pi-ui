import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { CreateProjectDto, UpsertProjectDto } from "@pi/shared";
import type { ProjectEntity } from "../Entity/project-entity.js";

const PROJECT_COLUMNS = "SELECT id, name, cwd, sort_order, last_opened_at, created_at, updated_at FROM project";

export class ProjectMapper {
  constructor(private readonly database: DatabaseSync) {}

  create(input: CreateProjectDto): ProjectEntity {
    const now = Date.now();
    const id = randomUUID();
    this.database
      .prepare("INSERT INTO project (id, name, cwd, sort_order, last_opened_at, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?, ?)")
      .run(id, input.name, input.cwd, now, now, now);
    return this.findById(id)!;
  }

  upsert(input: UpsertProjectDto): ProjectEntity {
    const now = Date.now();
    const id = input.id ?? randomUUID();
    this.database
      .prepare(
        `INSERT INTO project (id, name, cwd, sort_order, last_opened_at, created_at, updated_at) VALUES (?, ?, ?, 0, ?, ?, ?)
      ON CONFLICT(cwd) DO UPDATE SET name = excluded.name, last_opened_at = excluded.last_opened_at, updated_at = excluded.updated_at`,
      )
      .run(id, input.name, input.cwd, now, now, now);
    return this.findByCwd(input.cwd)!;
  }

  findByCwd(cwd: string): ProjectEntity | undefined {
    const row = this.database.prepare(`${PROJECT_COLUMNS} WHERE cwd = ?`).get(cwd);
    return row ? mapProject(row) : undefined;
  }

  findById(id: string): ProjectEntity | undefined {
    const row = this.database.prepare(`${PROJECT_COLUMNS} WHERE id = ?`).get(id);
    return row ? mapProject(row) : undefined;
  }

  findAll(): ProjectEntity[] {
    return this.database.prepare(`${PROJECT_COLUMNS} ORDER BY sort_order, last_opened_at DESC, id`).all().map(mapProject);
  }

  update(id: string, input: CreateProjectDto): ProjectEntity | undefined {
    const result = this.database
      .prepare("UPDATE project SET name = ?, cwd = ?, updated_at = ? WHERE id = ?")
      .run(input.name, input.cwd, Date.now(), id);
    return result.changes > 0 ? this.findById(id) : undefined;
  }

  delete(id: string): boolean {
    return this.database.prepare("DELETE FROM project WHERE id = ?").run(id).changes > 0;
  }
}

function mapProject(row: Record<string, unknown>): ProjectEntity {
  return {
    id: String(row.id),
    name: String(row.name),
    cwd: String(row.cwd),
    sortOrder: Number(row.sort_order),
    lastOpenedAt: row.last_opened_at === null ? null : Number(row.last_opened_at),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
  };
}
