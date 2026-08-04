import { describe, expect, it } from "vitest";
import { StorageLeaseConflictError, StorageLeaseManager } from "../src/index.js";

describe("StorageLeaseManager", () => {
  it("enforces a single writer and advances fencing epochs", () => {
    const manager = new StorageLeaseManager();
    const first = manager.acquire("session:/tmp/a.jsonl", "slot-a");

    expect(() => manager.acquire("session:/tmp/a.jsonl", "slot-b")).toThrow(StorageLeaseConflictError);
    manager.release(first);

    const second = manager.acquire("session:/tmp/a.jsonl", "slot-b");
    expect(second.fencingEpoch).toBe(first.fencingEpoch + 1);
  });

  it("transfers a provisional lease to the concrete session file", () => {
    const manager = new StorageLeaseManager();
    const provisional = manager.acquire("provisional:slot-a", "slot-a");
    const concrete = manager.transfer(provisional, "session:/tmp/a.jsonl");

    expect(manager.get("provisional:slot-a")).toBeUndefined();
    expect(manager.get("session:/tmp/a.jsonl")).toEqual(concrete);
  });

  it("keeps the current lease when transferring to the same resource", () => {
    const manager = new StorageLeaseManager();
    const lease = manager.acquire("session:/tmp/a.jsonl", "slot-a");

    expect(manager.transfer(lease, lease.resourceKey)).toBe(lease);
    expect(() => manager.release(lease)).not.toThrow();
  });
});
