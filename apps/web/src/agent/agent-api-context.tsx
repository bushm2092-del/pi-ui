import { SocketClient, type RealtimeConnectionState } from "@/http";
import type { AgentBackendConnection } from "@pi/shared";
import { ConversationApi, ProjectApi, RuntimeApi } from "@/http";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

export interface AgentApiContextValue {
  runtime?: RuntimeApi;
  project?: ProjectApi;
  conversation?: ConversationApi;
  connectionState: RealtimeConnectionState;
  error?: Error;
}

const AgentApiContext = createContext<AgentApiContextValue>({ connectionState: "idle" });

export function AgentApiProvider({
  connection,
  children,
}: PropsWithChildren<{ connection?: AgentBackendConnection }>) {
  const composed = useMemo(() => {
    if (!connection) return undefined;
    const client = new SocketClient(connection);
    return {
      client,
      runtime: new RuntimeApi(client),
      project: new ProjectApi(client),
      conversation: new ConversationApi(client),
    };
  }, [connection?.url, connection?.token]);

  const client = composed?.client;
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>(client ? "connecting" : "idle");
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!client) {
      setConnectionState("idle");
      setError(undefined);
      return;
    }
    setConnectionState(client.state);
    setError(undefined);
    const unsubscribe = client.onStateChange(setConnectionState);
    void client.connect().catch((reason) => {
      setError(reason instanceof Error ? reason : new Error(String(reason)));
      setConnectionState("closed");
    });
    return () => {
      unsubscribe();
      client.close();
    };
  }, [client]);

  const value = useMemo(
    () => ({
      runtime: composed?.runtime,
      project: composed?.project,
      conversation: composed?.conversation,
      connectionState,
      error,
    }),
    [composed, connectionState, error],
  );
  return <AgentApiContext.Provider value={value}>{children}</AgentApiContext.Provider>;
}

export function useAgentApi(): AgentApiContextValue {
  return useContext(AgentApiContext);
}
