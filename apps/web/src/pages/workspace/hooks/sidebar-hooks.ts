import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAgentApi } from "../../../agent/agent-api-context";

export const sidebarQueryKey = ["workspace", "sidebar"] as const;

export function useSidebar() {
  const { project, conversation } = useAgentApi();
  return useQuery({
    queryKey: sidebarQueryKey,
    queryFn: async () => {
      const [projects, conversations] = await Promise.all([project!.list(), conversation!.list()]);
      return { projects, ...conversations };
    },
    enabled: Boolean(project && conversation),
  });
}

export function usePinConversation() {
  const { conversation } = useAgentApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) => conversation!.pin(id, pinned),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sidebarQueryKey }),
  });
}

export function useArchiveConversation() {
  const { conversation } = useAgentApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => conversation!.archive(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sidebarQueryKey }),
  });
}

export function useExpandProjectConversations() {
  const { conversation } = useAgentApi();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (projectId: string) => ({
      projectId,
      conversations: await conversation!.listByProject({ projectId, limit: 100 }),
    }),
    onSuccess: ({ projectId, conversations }) =>
      queryClient.setQueryData<import("@pi/shared").SidebarDto>(sidebarQueryKey, (current) =>
        current
          ? {
              ...current,
              projects: current.projects.map((project) =>
                project.id === projectId ? { ...project, conversations, hasMore: false } : project,
              ),
            }
          : current,
      ),
  });
}
