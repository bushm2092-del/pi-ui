import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { EventStreamRegistry, type EventStreamRegistryOptions } from "../core/event-stream-registry.js";
import { JsonlOperationJournal } from "../core/operation-journal.js";
import { PiGateway, type PiGatewayAddress } from "../gateway/pi-gateway.js";
import { RuntimeService } from "../modules/runtimes/runtime-service.js";
import { AgentWorkerSupervisor } from "../supervisors/agent-worker-supervisor.js";

export interface StartPiBackendOptions {
  dataDir: string;
  token?: string;
  host?: string;
  port?: number;
  allowedOrigins?: string[];
  eventStreams?: EventStreamRegistryOptions;
  workerEntry?: string;
  workerExecArgv?: string[];
  onWorkerStderr?: (runtimeSlotId: string, text: string) => void;
}

export interface PiBackendHandle {
  token: string;
  address: PiGatewayAddress;
  gateway: PiGateway;
  runtimeService: RuntimeService;
  supervisor: AgentWorkerSupervisor;
  eventStreams: EventStreamRegistry;
  stop(): Promise<void>;
}

export async function startPiBackend(options: StartPiBackendOptions): Promise<PiBackendHandle> {
  const token = options.token ?? randomBytes(32).toString("base64url");
  const eventStreams = new EventStreamRegistry(options.eventStreams);
  const journal = new JsonlOperationJournal(join(options.dataDir, "operations.jsonl"));
  await journal.initialize();
  const supervisor = new AgentWorkerSupervisor({
    journal,
    workerEntry: options.workerEntry,
    workerExecArgv: options.workerExecArgv,
    onWorkerStderr: options.onWorkerStderr,
    onEvent(event) {
      eventStreams.append(event);
    }
  });
  const runtimeService = new RuntimeService(supervisor);
  const gateway = new PiGateway({
    runtimeService,
    eventStreams,
    token,
    host: options.host,
    port: options.port,
    allowedOrigins: options.allowedOrigins
  });
  try {
    const address = await gateway.start();
    let stopped = false;
    return {
      token,
      address,
      gateway,
      runtimeService,
      supervisor,
      eventStreams,
      async stop() {
        if (stopped) return;
        stopped = true;
        await gateway.stop();
        await supervisor.stopAll();
        await journal.flush();
      }
    };
  } catch (error) {
    await supervisor.stopAll();
    throw error;
  }
}
