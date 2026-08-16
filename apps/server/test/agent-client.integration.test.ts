import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { startPiBackend } from "@pi/server";
import type { RuntimeSnapshotDto } from "@pi/shared";
import { afterEach, describe, expect, it } from "vitest";
import { AgentClient } from "../../web/src/agent/agent-client.js";

const cleanup: Array<() => Promise<void>> = [];

afterEach(async () => {
  await Promise.all(cleanup.splice(0).map((dispose) => dispose()));
});

describe("AgentClient integration", () => {
  it("controls and subscribes to a real Pi runtime", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-agent-client-"));
    const workspace = join(directory, "workspace");
    const agentDir = join(directory, "agent");
    const sessionFile = join(directory, "session.jsonl");
    await mkdir(workspace, { recursive: true });
    await writeFile(
      sessionFile,
      `${JSON.stringify({
        type: "session",
        version: 3,
        id: "019fc870-5931-7496-9099-99b884a0bf03",
        timestamp: new Date().toISOString(),
        cwd: workspace,
      })}\n`,
      "utf8",
    );
    const backend = await startPiBackend({
      dataDir: join(directory, "backend"),
      token: "client-integration-token",
    });
    cleanup.push(async () => {
      await backend.stop();
      await rm(directory, { recursive: true, force: true });
    });
    const client = new AgentClient({
      url: backend.address.socketUrl,
      token: backend.token,
    });
    cleanup.push(async () => client.close());

    const created = await client.runtimes.create({
      runtimeSlotId: "client-slot",
      cwd: workspace,
      agentDir,
      sessionFile,
    });
    expect(created).toMatchObject({ runtimeSlotId: "client-slot", isIdle: true, isStreaming: false });

    let subscription: ReturnType<typeof client.realtime.subscribe> | undefined;
    const synchronized = new Promise<RuntimeSnapshotDto>((resolve) => {
      subscription = client.realtime.subscribe("client-slot", { onSnapshot: resolve });
    });
    await client.realtime.connect();
    expect(await synchronized).toMatchObject({ sessionId: created.sessionId });

    expect(await client.runtimes.rename("client-slot", "Agent client session")).toMatchObject({
      sessionName: "Agent client session",
    });
    subscription?.unsubscribe();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(await client.runtimes.get("client-slot")).toMatchObject({ isIdle: true, isStreaming: false });
    await client.runtimes.remove("client-slot");
  }, 30_000);
});
