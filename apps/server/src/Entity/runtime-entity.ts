export interface RuntimeEntity {
  runtimeSlotId: string;
  sessionId: string;
  cwd: string;
  sessionFile: string | null;
  sessionName: string | null;
  provider: string | null;
  modelId: string | null;
  createdAt: number;
  updatedAt: number;
}
