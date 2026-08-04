import { describe, expect, it } from "vitest";
import {
  ProtocolValidationError,
  createWorkerCommand,
  parseControlToWorkerMessage,
  parseWorkerToControlMessage
} from "../src/index.js";

describe("worker IPC protocol", () => {
  it("round-trips a typed initialize command", () => {
    const command = createWorkerCommand("runtime.initialize", {
      runtimeSlotId: "slot-1",
      cwd: "/workspace"
    }, "operation-1");

    expect(parseControlToWorkerMessage(command)).toEqual(command);
  });

  it("rejects unsupported commands", () => {
    expect(() => parseControlToWorkerMessage({
      v: 1,
      kind: "command",
      operationId: "operation-1",
      method: "runtime.unknown",
      payload: {}
    })).toThrow(ProtocolValidationError);
  });

  it("rejects non-JSON event payloads", () => {
    expect(() => parseWorkerToControlMessage({
      v: 1,
      kind: "event",
      streamId: "stream-1",
      cursor: 1,
      event: "agent.event",
      payload: { invalid: undefined }
    })).toThrow("JSON-compatible");
  });
});
