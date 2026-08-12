import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { JsonValue } from "@pi/shared";
export type OperationStatus = "accepted" | "running" | "completed" | "failed" | "uncertain";
export interface OperationRecord {
  operationId: string;
  runtimeSlotId: string;
  method: string;
  status: OperationStatus;
  timestamp: number;
  result?: JsonValue;
  error?: { code: string; message: string };
}
export class JsonlOperationJournal {
  #records = new Map<string, OperationRecord>();
  #writeQueue = Promise.resolve();
  constructor(readonly path: string) {}
  async initialize(): Promise<void> {
    await mkdir(dirname(this.path), { recursive: true });
    let content = "";
    try {
      content = await readFile(this.path, "utf8");
    } catch (error) {
      if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
    }
    for (const line of content.split("\n")) {
      if (!line.trim()) continue;
      const record = parseRecord(line);
      if (record) this.#records.set(record.operationId, record);
    }
    for (const record of [...this.#records.values()].filter((item) => item.status === "accepted" || item.status === "running"))
      await this.transition(record.operationId, "uncertain", {
        error: { code: "process_interrupted", message: "Operation state is uncertain after process interruption" },
      });
  }
  async accept(operationId: string, runtimeSlotId: string, method: string): Promise<OperationRecord> {
    if (this.#records.has(operationId)) throw new Error(`Operation already exists: ${operationId}`);
    return this.#append({ operationId, runtimeSlotId, method, status: "accepted", timestamp: Date.now() });
  }
  async transition(
    operationId: string,
    status: Exclude<OperationStatus, "accepted">,
    details: Pick<OperationRecord, "result" | "error"> = {},
  ): Promise<OperationRecord> {
    const current = this.#records.get(operationId);
    if (!current) throw new Error(`Unknown operation: ${operationId}`);
    const allowed: Record<OperationStatus, OperationStatus[]> = {
      accepted: ["running", "failed", "uncertain"],
      running: ["completed", "failed", "uncertain"],
      completed: [],
      failed: [],
      uncertain: [],
    };
    if (!allowed[current.status].includes(status)) throw new Error(`Invalid operation transition: ${current.status} -> ${status}`);
    return this.#append({ ...current, ...details, status, timestamp: Date.now() });
  }
  get(operationId: string): OperationRecord | undefined {
    return this.#records.get(operationId);
  }
  async flush(): Promise<void> {
    await this.#writeQueue;
  }
  async #append(record: OperationRecord): Promise<OperationRecord> {
    this.#writeQueue = this.#writeQueue.then(() => appendFile(this.path, `${JSON.stringify(record)}\n`, "utf8"));
    await this.#writeQueue;
    this.#records.set(record.operationId, record);
    return record;
  }
}
function parseRecord(line: string): OperationRecord | undefined {
  try {
    const value = JSON.parse(line) as Partial<OperationRecord>;
    if (
      typeof value.operationId !== "string" ||
      typeof value.runtimeSlotId !== "string" ||
      typeof value.method !== "string" ||
      typeof value.timestamp !== "number" ||
      !["accepted", "running", "completed", "failed", "uncertain"].includes(String(value.status))
    )
      return undefined;
    return value as OperationRecord;
  } catch {
    return undefined;
  }
}
