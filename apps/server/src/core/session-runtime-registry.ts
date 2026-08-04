import type { RuntimeSnapshotDto } from "@pi/protocol";
import type { StorageLease } from "./storage-lease-manager.js";

export interface RegisteredRuntime {
  runtimeSlotId: string;
  workerId: string;
  snapshot: RuntimeSnapshotDto;
  storageLease: StorageLease;
}

export class SessionRuntimeRegistry {
  #bySlot = new Map<string, RegisteredRuntime>();
  #slotBySession = new Map<string, string>();
  #slotByFile = new Map<string, string>();

  register(runtime: RegisteredRuntime): void {
    if (this.#bySlot.has(runtime.runtimeSlotId)) {
      throw new Error(`Runtime slot is already registered: ${runtime.runtimeSlotId}`);
    }
    this.#assertIdentityAvailable(runtime.snapshot.sessionId, runtime.snapshot.sessionFile);
    this.#bySlot.set(runtime.runtimeSlotId, runtime);
    this.#slotBySession.set(runtime.snapshot.sessionId, runtime.runtimeSlotId);
    if (runtime.snapshot.sessionFile) this.#slotByFile.set(runtime.snapshot.sessionFile, runtime.runtimeSlotId);
  }

  update(runtimeSlotId: string, snapshot: RuntimeSnapshotDto, storageLease?: StorageLease): RegisteredRuntime {
    const current = this.requireBySlot(runtimeSlotId);
    if (snapshot.sessionId !== current.snapshot.sessionId || snapshot.sessionFile !== current.snapshot.sessionFile) {
      this.#assertIdentityAvailable(snapshot.sessionId, snapshot.sessionFile, runtimeSlotId);
      this.#slotBySession.delete(current.snapshot.sessionId);
      if (current.snapshot.sessionFile) this.#slotByFile.delete(current.snapshot.sessionFile);
      this.#slotBySession.set(snapshot.sessionId, runtimeSlotId);
      if (snapshot.sessionFile) this.#slotByFile.set(snapshot.sessionFile, runtimeSlotId);
    }
    const next = { ...current, snapshot, storageLease: storageLease ?? current.storageLease };
    this.#bySlot.set(runtimeSlotId, next);
    return next;
  }

  remove(runtimeSlotId: string): RegisteredRuntime | undefined {
    const current = this.#bySlot.get(runtimeSlotId);
    if (!current) return undefined;
    this.#bySlot.delete(runtimeSlotId);
    this.#slotBySession.delete(current.snapshot.sessionId);
    if (current.snapshot.sessionFile) this.#slotByFile.delete(current.snapshot.sessionFile);
    return current;
  }

  getBySlot(runtimeSlotId: string): RegisteredRuntime | undefined {
    return this.#bySlot.get(runtimeSlotId);
  }

  requireBySlot(runtimeSlotId: string): RegisteredRuntime {
    const runtime = this.getBySlot(runtimeSlotId);
    if (!runtime) throw new Error(`Unknown runtime slot: ${runtimeSlotId}`);
    return runtime;
  }

  getBySession(sessionId: string): RegisteredRuntime | undefined {
    const slot = this.#slotBySession.get(sessionId);
    return slot ? this.#bySlot.get(slot) : undefined;
  }

  #assertIdentityAvailable(sessionId: string, sessionFile?: string, allowedSlot?: string): void {
    const sessionSlot = this.#slotBySession.get(sessionId);
    if (sessionSlot && sessionSlot !== allowedSlot) throw new Error(`Session already has a writer: ${sessionId}`);
    if (sessionFile) {
      const fileSlot = this.#slotByFile.get(sessionFile);
      if (fileSlot && fileSlot !== allowedSlot) throw new Error(`Session file already has a writer: ${sessionFile}`);
    }
  }
}
