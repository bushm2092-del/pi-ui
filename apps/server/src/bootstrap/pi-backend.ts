import { randomBytes } from "node:crypto";
import { RuntimeController } from "../Controller/runtime-controller.js";
import { ProjectController } from "../Controller/project-controller.js";
import { ConversationController } from "../Controller/conversation-controller.js";
import { RuntimeMapper } from "../Mapper/runtime-mapper.js";
import { ConversationMapper } from "../Mapper/conversation-mapper.js";
import { ProjectMapper } from "../Mapper/project-mapper.js";
import { RuntimeService } from "../Service/runtime-service.js";
import { ProjectService } from "../Service/project-service.js";
import { ConversationService } from "../Service/conversation-service.js";
import { SocketServer, type SocketServerAddress } from "../Server/socket-server.js";
import { initializePiUiHome, type PiUiHome } from "../Storage/pi-ui-home.js";
import { PiUiDatabase } from "../Storage/Database/database.js";

export interface StartPiBackendOptions {
  /** Directory used to store the database and other Pi UI state. */
  dataDir?: string;
  /** Authentication token accepted by the socket server. A secure token is generated when omitted. */
  token?: string;
  /** Network interface on which the socket server listens. */
  host?: string;
  /** TCP port on which the socket server listens. */
  port?: number;
}

/** Resources exposed by a running Pi backend instance. */
export interface PiBackendHandle {
  token: string;
  address: SocketServerAddress;
  socketServer: SocketServer;
  runtimeService: RuntimeService;
  home: PiUiHome;
  stop(): Promise<void>;
}

/** Initializes the backend dependencies and starts the authenticated socket server. */
export async function startPiBackend(options: StartPiBackendOptions = {}): Promise<PiBackendHandle> {
  const token = options.token ?? randomBytes(32).toString("base64url");
  const home = await initializePiUiHome(options.dataDir);
  const database = new PiUiDatabase(home.databaseFile);
  const runtimeMapper = new RuntimeMapper(database.connection);
  const projectMapper = new ProjectMapper(database.connection);
  const conversationMapper = new ConversationMapper(database.connection);

  // Runtime events are forwarded after the socket server has been created and assigned.
  let socketServer: SocketServer | undefined;
  const runtimeService = new RuntimeService(runtimeMapper, (event) => {
    socketServer?.emitToRoom(`runtime:${event.runtimeSlotId}`, "runtime:event", event);
  });
  const projectService = new ProjectService(projectMapper, conversationMapper, database.connection);
  const conversationService = new ConversationService(conversationMapper);
  const controllers = [
    new RuntimeController(runtimeService),
    new ProjectController(projectService),
    new ConversationController(conversationService),
  ];
  socketServer = new SocketServer({
    token,
    host: options.host,
    port: options.port,
    controllers,
  });
  try {
    const address = await socketServer.start();
    let stopped = false;
    return {
      token,
      address,
      socketServer,
      runtimeService,
      home,
      async stop() {
        // Make shutdown idempotent so callers can safely invoke it more than once.
        if (stopped) return;
        stopped = true;
        const failures: unknown[] = [];
        try {
          await socketServer.stop();
        } catch (error) {
          failures.push(error);
        }
        try {
          await runtimeService.stopAll();
        } catch (error) {
          failures.push(error);
        }
        try {
          database.close();
        } catch (error) {
          failures.push(error);
        }
        if (failures.length > 0) throw new AggregateError(failures, "Failed to fully stop the Pi backend");
      },
    };
  } catch (error) {
    // Release resources initialized before a server startup failure.
    const failures: unknown[] = [error];
    try {
      await runtimeService.stopAll();
    } catch (cleanupError) {
      failures.push(cleanupError);
    }
    try {
      database.close();
    } catch (cleanupError) {
      failures.push(cleanupError);
    }
    if (failures.length === 1) throw error;
    throw new AggregateError(failures, "Failed to start and clean up the Pi backend");
  }
}
