/** Database row backing one local project in the sidebar. */
export interface ProjectEntity {
  id: string;
  name: string;
  cwd: string;
  sortOrder: number;
  lastOpenedAt: number | null;
  createdAt: number;
  updatedAt: number;
}
