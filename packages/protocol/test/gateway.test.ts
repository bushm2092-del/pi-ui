import { describe, expect, it } from "vitest";
import {
  GatewayProtocolValidationError,
  parseGatewayClientMessage,
  parseGatewayServerMessage
} from "../src/index.js";

describe("gateway protocol", () => {
  it("parses a resumable subscription", () => {
    expect(parseGatewayClientMessage({
      v: 1,
      kind: "subscribe",
      subscriptionId: "sub-1",
      runtimeSlotId: "slot-1",
      resume: { streamId: "stream-1", afterCursor: 12 }
    })).toMatchObject({ kind: "subscribe", resume: { afterCursor: 12 } });
  });

  it("rejects an invalid resume cursor", () => {
    expect(() => parseGatewayClientMessage({
      v: 1,
      kind: "subscribe",
      subscriptionId: "sub-1",
      runtimeSlotId: "slot-1",
      resume: { streamId: "stream-1", afterCursor: -1 }
    })).toThrow(GatewayProtocolValidationError);
  });

  it("validates server runtime events", () => {
    expect(parseGatewayServerMessage({
      v: 1,
      kind: "runtime.event",
      subscriptionId: "sub-1",
      runtimeSlotId: "slot-1",
      streamId: "stream-1",
      cursor: 2,
      event: "agent.event",
      payload: { type: "message_update" }
    })).toMatchObject({ kind: "runtime.event", cursor: 2 });
  });
});
