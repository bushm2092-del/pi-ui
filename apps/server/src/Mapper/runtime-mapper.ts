import type { RuntimeSnapshotDto } from "@pi/shared";
import type { RuntimeEntity } from "../Entity/runtime-entity.js";

export interface RuntimeMapper {
  save(runtime: RuntimeSnapshotDto): RuntimeEntity;
  findById(runtimeSlotId: string): RuntimeEntity | undefined;
  findAll(): RuntimeEntity[];
  delete(runtimeSlotId: string): boolean;
  close(): void;
}
