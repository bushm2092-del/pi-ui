import type { WorkerEventMessage } from "@pi/protocol";
import { describe, expect, it, vi } from "vitest";
import { EventStreamRegistry } from "../src/index.js";

describe("EventStreamRegistry", () => {
  it("replays buffered events and forwards live events", () => {
    const registry = new EventStreamRegistry({ maxEventsPerStream: 3 });
    registry.append(event("stream-1", 1));
    registry.append(event("stream-1", 2));
    const listener = vi.fn();

    const attachment = registry.attach(
      "slot-1",
      { streamId: "stream-1", afterCursor: 1 },
      listener
    );
    registry.append(event("stream-1", 3));

    expect(attachment.replay.map((item) => item.cursor)).toEqual([2]);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ cursor: 3 }));
    attachment.unsubscribe();
  });

  it("requires a snapshot when the cursor expired", () => {
    const registry = new EventStreamRegistry({ maxEventsPerStream: 2 });
    registry.append(event("stream-1", 1));
    registry.append(event("stream-1", 2));
    registry.append(event("stream-1", 3));

    const attachment = registry.attach("slot-1", { streamId: "stream-1", afterCursor: 0 }, () => undefined);

    expect(attachment.resetReason).toBe("cursor_expired");
    attachment.unsubscribe();
  });

  it("detects replacement of a runtime event stream", () => {
    const registry = new EventStreamRegistry();
    registry.append(event("stream-old", 1));
    registry.append(event("stream-new", 1));

    const attachment = registry.attach("slot-1", { streamId: "stream-old", afterCursor: 1 }, () => undefined);

    expect(attachment.resetReason).toBe("stream_replaced");
    expect(attachment.streamId).toBe("stream-new");
    attachment.unsubscribe();
  });
});

function event(streamId: string, cursor: number): WorkerEventMessage {
  return {
    v: 1,
    kind: "event",
    streamId,
    cursor,
    runtimeSlotId: "slot-1",
    event: "agent.event",
    payload: { cursor }
  };
}
