import { randomUUID } from "node:crypto";

export interface StorageLease {
  resourceKey: string;
  ownerId: string;
  leaseId: string;
  fencingEpoch: number;
  acquiredAt: number;
}

export class StorageLeaseConflictError extends Error {
  constructor(
    readonly resourceKey: string,
    readonly currentOwnerId: string
  ) {
    super(`Storage resource is already leased: ${resourceKey}`);
    this.name = "StorageLeaseConflictError";
  }
}

export class StorageLeaseManager {
  #leases = new Map<string, StorageLease>();
  #epochs = new Map<string, number>();

  acquire(resourceKey: string, ownerId: string): StorageLease {
    const current = this.#leases.get(resourceKey);
    if (current) throw new StorageLeaseConflictError(resourceKey, current.ownerId);
    const fencingEpoch = (this.#epochs.get(resourceKey) ?? 0) + 1;
    this.#epochs.set(resourceKey, fencingEpoch);
    const lease: StorageLease = {
      resourceKey,
      ownerId,
      leaseId: randomUUID(),
      fencingEpoch,
      acquiredAt: Date.now()
    };
    this.#leases.set(resourceKey, lease);
    return lease;
  }

  transfer(lease: StorageLease, nextResourceKey: string): StorageLease {
    this.#assertCurrent(lease);
    if (lease.resourceKey === nextResourceKey) return lease;
    const next = this.#leases.get(nextResourceKey);
    if (next) throw new StorageLeaseConflictError(nextResourceKey, next.ownerId);
    this.#leases.delete(lease.resourceKey);
    const fencingEpoch = (this.#epochs.get(nextResourceKey) ?? 0) + 1;
    this.#epochs.set(nextResourceKey, fencingEpoch);
    const transferred = { ...lease, resourceKey: nextResourceKey, fencingEpoch };
    this.#leases.set(nextResourceKey, transferred);
    return transferred;
  }

  release(lease: StorageLease): void {
    this.#assertCurrent(lease);
    this.#leases.delete(lease.resourceKey);
  }

  get(resourceKey: string): StorageLease | undefined {
    return this.#leases.get(resourceKey);
  }

  #assertCurrent(lease: StorageLease): void {
    const current = this.#leases.get(lease.resourceKey);
    if (!current || current.leaseId !== lease.leaseId || current.fencingEpoch !== lease.fencingEpoch) {
      throw new Error(`Stale storage lease: ${lease.resourceKey}`);
    }
  }
}
