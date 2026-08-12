import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAgentClient } from "../../../agent/agent-client-context";

export const sidebarQueryKey = ["workspace", "sidebar"] as const;

export function useSidebar() {
  const { client } = useAgentClient();
  return useQuery({ queryKey: sidebarQueryKey, queryFn: async () => { const [projects, conversations] = await Promise.all([client!.projects.list(), client!.conversations.list()]); return { projects, ...conversations }; }, enabled: Boolean(client) });
}

export function usePinConversation() {
  const { client } = useAgentClient();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => client!.conversations.pin(id, pinned),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sidebarQueryKey }) });
}

export function useArchiveConversation() {
  const { client } = useAgentClient();
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => client!.conversations.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sidebarQueryKey }) });
}

export function useExpandProjectConversations() {
  const { client } = useAgentClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => ({ projectId, conversations: await client!.conversations.listByProject({ projectId, limit: 100 }) }),
    onSuccess: ({ projectId, conversations }) => queryClient.setQueryData<import("@pi/shared").SidebarDto>(sidebarQueryKey, (current) => current ? ({
      ...current,
      projects: current.projects.map((project) => project.id === projectId ? { ...project, conversations, hasMore: false } : project),
    }) : current),
  });
}
