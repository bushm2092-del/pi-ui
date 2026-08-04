import { RuntimeHttpClient, type RuntimeHttpClientOptions } from "./http-client.js";
import { RuntimeRealtimeClient, type RuntimeRealtimeClientOptions } from "./realtime-client.js";

export interface AgentBackendConnection {
  httpUrl: string;
  webSocketUrl: string;
  token: string;
}

export interface AgentClientOptions extends AgentBackendConnection {
  fetch?: RuntimeHttpClientOptions["fetch"];
  webSocketFactory?: RuntimeRealtimeClientOptions["webSocketFactory"];
  reconnectBaseDelayMs?: number;
  reconnectMaxDelayMs?: number;
  connectionTimeoutMs?: number;
}

export class AgentClient {
  readonly runtimes: RuntimeHttpClient;
  readonly realtime: RuntimeRealtimeClient;

  constructor(options: AgentClientOptions) {
    this.runtimes = new RuntimeHttpClient({
      baseUrl: options.httpUrl,
      token: options.token,
      fetch: options.fetch
    });
    this.realtime = new RuntimeRealtimeClient({
      webSocketUrl: options.webSocketUrl,
      token: options.token,
      webSocketFactory: options.webSocketFactory,
      reconnectBaseDelayMs: options.reconnectBaseDelayMs,
      reconnectMaxDelayMs: options.reconnectMaxDelayMs,
      connectionTimeoutMs: options.connectionTimeoutMs
    });
  }

  close(): void {
    this.realtime.close();
  }
}
