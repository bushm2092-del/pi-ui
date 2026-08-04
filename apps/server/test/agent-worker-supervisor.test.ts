import { createRequire } from "node:module";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { AgentWorkerSupervisor, JsonlOperationJournal } from "../src/index.js";

const tempDirectories: string[] = [];
const require = createRequire(import.meta.url);

afterEach(async () => {
  await Promise.all(tempDirectories.splice(0).map((path) => rm(path, { recursive: true, force: true })));
});

describe("AgentWorkerSupervisor", () => {
  it("starts a Pi runtime, persists session identity, and reopens it", async () => {
    const directory = await mkdtemp(join(tmpdir(), "pi-ui-runtime-"));
    tempDirectories.push(directory);
    const workspace = join(directory, "workspace");
    const agentDir = join(directory, "agent");
    await mkdir(workspace, { recursive: true });
    const sessionId = "019fc870-5931-7496-9099-99b884a0bf00";
    const sessionFile = join(directory, "session.jsonl");
    await writeFile(sessionFile, `${JSON.stringify({
      type: "session",
      version: 3,
      id: sessionId,
      timestamp: new Date().toISOString(),
      cwd: workspace
    })}\n`, "utf8");
    const journal = new JsonlOperationJournal(join(directory, "operations.jsonl"));
    await journal.initialize();
    const workerEntry = fileURLToPath(new URL("../../agent-worker/src/main.ts", import.meta.url));
    const workerExecArgv = ["--import", require.resolve("tsx")];
    const supervisor = new AgentWorkerSupervisor({ workerEntry, workerExecArgv, journal });

    try {
      const initial = await supervisor.startRuntime({
        runtimeSlotId: "slot-1",
        cwd: workspace,
        agentDir,
        sessionFile
      });
      const named = await supervisor.setSessionName("slot-1", "Persistent session");
      expect(named.sessionId).toBe(initial.sessionId);
      expect(named.sessionFile).toBeTruthy();
      expect(named.sessionName).toBe("Persistent session");

      await supervisor.stopRuntime("slot-1");
      const reopened = await supervisor.startRuntime({
        runtimeSlotId: "slot-2",
        cwd: workspace,
        agentDir,
        sessionFile
      });

      expect(reopened.sessionId).toBe(initial.sessionId);
      expect(reopened.sessionName).toBe("Persistent session");
      expect(supervisor.registry.getBySession(initial.sessionId)?.runtimeSlotId).toBe("slot-2");
    } finally {
      await supervisor.stopAll();
    }
  }, 30_000);
});
