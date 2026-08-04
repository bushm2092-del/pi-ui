import type { ComponentType } from "react";

export type LayoutSlots = Record<string, ComponentType>;

export interface LayoutProps {
  slots?: LayoutSlots;
  rootProps?: Record<string, unknown>;
}

export function LayoutSlot({
  name,
  slots,
}: {
  name: string;
  slots: LayoutSlots;
}) {
  const Slot = slots[name];
  return Slot ? <Slot /> : null;
}
