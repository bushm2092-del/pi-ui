import type { GatewayClientMessage, GatewayServerMessage, RuntimeSnapshotDto } from "@pi/protocol";
import { describe, expect, it, vi } from "vitest";
import { RuntimeRealtimeClient, type WebSocketLike } from "../src/index.js";

describe("RuntimeRealtimeClient", () => {
  it("reconnects, resumes from the last cursor, and de-duplicates events", async () => {
    const sockets: MockWebSocket[] = [];
    const snapshots = vi.fn();
    const events = vi.fn();
    const client = new RuntimeRealtimeClient({
      webSocketUrl: "ws://localhost/events",
      token: "secret",
      reconnectBaseDelayMs: 1,
      reconnectMaxDelayMs: 1,
      random: () => 0,
      webSocketFactory: (url, protocols) => {
        const socket = new MockWebSocket(url, protocols);
        sockets.push(socket);
        return socket;
      }
    });
    const subscription = client.subscribe("slot-1", { onSnapshot: snapshots, onEvent: events });

    const connecting = client.connect();
    sockets[0].open();
    sockets[0].receive({ v: 1, kind: "connection.ready", connectionId: "connection-1", heartbeatIntervalMs: 15_000 });
    await connecting;
    expect(sockets[0].sent[0]).toMatchObject({
      kind: "subscribe",
      subscriptionId: subscription.subscriptionId,
      runtimeSlotId: "slot-1"
    });

    sockets[0].receive({
      v: 1,
      kind: "subscription.ready",
      subscriptionId: subscription.subscriptionId,
      runtimeSlotId: "slot-1",
      snapshot: snapshot(),
      streamId: "stream-1",
      latestCursor: 2
    });
    const event: GatewayServerMessage = {
      v: 1,
      kind: "runtime.event",
      subscriptionId: subscription.subscriptionId,
      runtimeSlotId: "slot-1",
      streamId: "stream-1",
      cursor: 3,
      event: "agent.event",
      payload: { value: 3 }
    };
    sockets[0].receive(event);
    sockets[0].receive(event);
    expect(events).toHaveBeenCalledTimes(1);

    sockets[0].disconnect();
    await vi.waitFor(() => expect(sockets).toHaveLength(2));
    sockets[1].open();
    sockets[1].receive({ v: 1, kind: "connection.ready", connectionId: "connection-2", heartbeatIntervalMs: 15_000 });

    expect(sockets[1].sent[0]).toMatchObject({
      kind: "subscribe",
      resume: { streamId: "stream-1", afterCursor: 3 }
    });
    sockets[1].receive({
      v: 1,
      kind: "subscription.reset_required",
      subscriptionId: subscription.subscriptionId,
      runtimeSlotId: "slot-1",
      snapshot: snapshot(),
      reason: "cursor_expired"
    });
    expect(snapshots).toHaveBeenLastCalledWith(expect.objectContaining({ runtimeSlotId: "slot-1" }), "reset");

    client.close();
    expect(client.state).toBe("closed");
  });
});

class MockWebSocket implements WebSocketLike {
  readyState = 0;
  onopen: ((event: unknown) => void) | null = null;
  onmessage: ((event: { data: unknown }) => void) | null = null;
  onclose: ((event: unknown) => void) | null = null;
  onerror: ((event: unknown) => void) | null = null;
  sent: GatewayClientMessage[] = [];

  constructor(
    readonly url: string,
    readonly protocols: string[]
  ) {}

  open(): void {
    this.readyState = 1;
    this.onopen?.({});
  }

  receive(message: GatewayServerMessage): void {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  disconnect(): void {
    this.readyState = 3;
    this.onclose?.({});
  }

  send(data: string): void {
    this.sent.push(JSON.parse(data) as GatewayClientMessage);
  }

  close(): void {
    this.disconnect();
  }
}

function snapshot(): RuntimeSnapshotDto {
  return {
    runtimeSlotId: "slot-1",
    state: "ready",
    cwd: "/tmp/project",
    sessionId: "session-1",
    isStreaming: false,
    thinkingLevel: "medium",
    messages: [],
    diagnostics: []
  };
}
