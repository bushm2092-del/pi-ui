import { describe, expect, it } from "vitest";
import { snapshotToMessages } from "./agent-workspace-repository";

describe("snapshotToMessages", () => {
  it("ignores legacy assistant messages without structured blocks", () => {
    expect(snapshotToMessages([
      { role: "assistant", content: "Legacy response", timestamp: 1_700_000_000_000 },
    ])).toEqual([]);
  });

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
    expect(snapshotToMessages([{
      role: "assistant",
      content: [
        { type: "thinking", thinking: "hidden" },
        { type: "toolCall", id: "call-1", name: "read", arguments: { path: "README.md" } },
      ],
      timestamp: 1_700_000_001_000,
      stopReason: "toolUse",
    }])[0]?.blocks).toMatchObject([
      { type: "thinking", content: "hidden" },
      { type: "tool", toolCallId: "call-1", name: "read" },
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
