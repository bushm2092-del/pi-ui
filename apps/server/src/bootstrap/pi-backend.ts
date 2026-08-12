import { randomBytes } from "node:crypto";
import { RuntimeController } from "../Controller/runtime-controller.js";
import { ProjectController } from "../Controller/project-controller.js";
import { ConversationController } from "../Controller/conversation-controller.js";
import { ExceptionInterceptor } from "../Interceptor/exception-interceptor.js";
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
  dataDir?: string;
  token?: string;
  host?: string;
  port?: number;
}
export interface PiBackendHandle {
  token: string;
  address: SocketServerAddress;
  socketServer: SocketServer;
  runtimeService: RuntimeService;
  home: PiUiHome;
  stop(): Promise<void>;
}

export async function startPiBackend(options: StartPiBackendOptions = {}): Promise<PiBackendHandle> {
  const token = options.token ?? randomBytes(32).toString("base64url");
  const home = await initializePiUiHome(options.dataDir);
  const database = new PiUiDatabase(home.databaseFile);
  const runtimeMapper = new RuntimeMapper(database.connection);
  const projectMapper = new ProjectMapper(database.connection);
  const conversationMapper = new ConversationMapper(database.connection);
  let socketServer: SocketServer | undefined;
  const runtimeService = new RuntimeService(runtimeMapper, (event) => {
    socketServer?.emitToRoom(`runtime:${event.runtimeSlotId}`, "runtime:event", event);
  });
  const exceptionInterceptor = new ExceptionInterceptor();
  const projectService = new ProjectService(projectMapper, conversationMapper);
  const conversationService = new ConversationService(conversationMapper);
  const controllers = [
    new RuntimeController(runtimeService, exceptionInterceptor),
    new ProjectController(projectService, exceptionInterceptor),
    new ConversationController(conversationService, exceptionInterceptor),
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
        if (stopped) return;
        stopped = true;
        await socketServer.stop();
        await runtimeService.stopAll();
        database.close();
      },
    };
  } catch (error) {
    await runtimeService.stopAll();
    database.close();
    throw error;
  }
}
