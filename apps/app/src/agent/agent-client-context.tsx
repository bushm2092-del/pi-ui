import {
  AgentClient,
  type RealtimeConnectionState
} from "./agent-client";
import type { AgentBackendConnection } from "@pi/shared";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

export interface AgentClientContextValue {
  client?: AgentClient;
  connectionState: RealtimeConnectionState;
  error?: Error;
}

const AgentClientContext = createContext<AgentClientContextValue>({ connectionState: "idle" });

export function AgentClientProvider({
  connection,
  children
}: PropsWithChildren<{ connection?: AgentBackendConnection }>) {
  const client = useMemo(() => connection ? new AgentClient(connection) : undefined, [
    connection?.url,
    connection?.token
  ]);
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>(client ? "connecting" : "idle");
  const [error, setError] = useState<Error>();

  useEffect(() => {
    if (!client) {
      setConnectionState("idle");
      setError(undefined);
      return;
    }
    setConnectionState(client.realtime.state);
    const unsubscribe = client.realtime.onStateChange(setConnectionState);
    void client.realtime.connect().catch((reason) => {
      setError(reason instanceof Error ? reason : new Error(String(reason)));
    });
    return () => {
      unsubscribe();
      client.close();
    };
  }, [client]);

  const value = useMemo(() => ({ client, connectionState, error }), [client, connectionState, error]);
  return <AgentClientContext.Provider value={value}>{children}</AgentClientContext.Provider>;
}

export function useAgentClient(): AgentClientContextValue {
  return useContext(AgentClientContext);
}
