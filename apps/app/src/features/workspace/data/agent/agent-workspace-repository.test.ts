import { describe, expect, it } from "vitest";
import { readAgentTextDelta, snapshotToMessages } from "./agent-workspace-repository";

describe("snapshotToMessages", () => {
  it("maps Pi user and assistant text into workspace messages", () => {
    expect(snapshotToMessages([
      { role: "user", content: "Hello", timestamp: 1_700_000_000_000 },
      {
        role: "assistant",
        content: [
          { type: "thinking", thinking: "hidden" },
          { type: "text", text: "Hi there" },
        ],
        timestamp: 1_700_000_001_000,
        stopReason: "stop",
      },
    ])).toMatchObject([
      { role: "user", content: "Hello", status: "complete" },
      { role: "assistant", content: "Hi there", status: "complete" },
    ]);
  });

  it("ignores tool results and marks failed assistant messages", () => {
    expect(snapshotToMessages([
      { role: "toolResult", content: [{ type: "text", text: "output" }] },
      {
        role: "assistant",
        content: [{ type: "text", text: "Request failed" }],
        timestamp: 1_700_000_001_000,
        stopReason: "error",
      },
    ])).toMatchObject([
      { role: "assistant", content: "Request failed", status: "failed" },
    ]);
  });

  it("restores A2UI surfaces from persisted tool results", () => {
    expect(snapshotToMessages([{
      role: "toolResult",
      toolCallId: "call-1",
      timestamp: 1_700_000_002_000,
      details: {
        kind: "a2ui.surface",
        protocolVersion: "v0.9",
        surfaceId: "sales",
        messages: [{ version: "v0.9", createSurface: { surfaceId: "sales", catalogId: "charts" } }],
      },
    }])).toMatchObject([{
      role: "a2ui",
      a2ui: { surfaceId: "sales", protocolVersion: "v0.9" },
    }]);
  });
});

describe("readAgentTextDelta", () => {
  it("reads only assistant text delta events", () => {
    expect(readAgentTextDelta("agent.event", {
      type: "message_update",
      assistantMessageEvent: { type: "text_delta", delta: "chunk" },
    })).toBe("chunk");
    expect(readAgentTextDelta("agent.event", {
      type: "message_update",
      assistantMessageEvent: { type: "thinking_delta", delta: "hidden" },
    })).toBeUndefined();
    expect(readAgentTextDelta("runtime.phase", { state: "running" })).toBeUndefined();
  });
});
