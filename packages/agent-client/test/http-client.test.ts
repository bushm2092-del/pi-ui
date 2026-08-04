import type { RuntimeSnapshotDto } from "@pi/protocol";
import { describe, expect, it, vi } from "vitest";
import { PiApiError, RuntimeHttpClient } from "../src/index.js";

describe("RuntimeHttpClient", () => {
  it("sends authenticated runtime commands and validates snapshots", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify(snapshot()), {
      status: 201,
      headers: { "content-type": "application/json" }
    })) as unknown as typeof fetch;
    const client = new RuntimeHttpClient({ baseUrl: "http://localhost:4000/", token: "secret", fetch: fetchMock });

    const result = await client.create({ cwd: "/tmp/project", runtimeSlotId: "slot-1" });

    expect(result.runtimeSlotId).toBe("slot-1");
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:4000/v1/runtimes", expect.objectContaining({
      method: "POST",
      headers: expect.objectContaining({ authorization: "Bearer secret" })
    }));
  });

  it("maps structured server failures to PiApiError", async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({
      error: { code: "runtime_not_found", message: "Missing runtime", retryable: false, requestId: "req-1" }
    }), { status: 404 })) as unknown as typeof fetch;
    const client = new RuntimeHttpClient({ baseUrl: "http://localhost:4000", token: "secret", fetch: fetchMock });

    const error = await client.get("missing").catch((value) => value);

    expect(error).toBeInstanceOf(PiApiError);
    expect(error).toMatchObject({ status: 404, code: "runtime_not_found", requestId: "req-1" });
  });
});

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
