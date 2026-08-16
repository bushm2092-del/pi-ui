import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Conversation } from "../domain";
import { workspaceData } from "../data/workspace-data";
import { useWorkspaceRepository } from "../data/workspace-repository-context";
import {
  appendPendingTurn,
  failPendingTurn,
  resolvePendingTurn,
  stopPendingTurn,
} from "./conversation-cache";

export const workspaceQueryKeys = {
  all: ["workspace"] as const,
  conversation: (conversationId: string) =>
    [...workspaceQueryKeys.all, "conversation", conversationId] as const,
};

export function useConversation(conversationId = workspaceData.conversation.id) {
  const repository = useWorkspaceRepository();

  return useQuery({
    queryKey: workspaceQueryKeys.conversation(conversationId),
    queryFn: ({ signal }) => repository.getConversation(conversationId, signal),
  });
}

interface SendContext {
  assistantMessageId?: string;
}

export function useSendMessage(conversationId = workspaceData.conversation.id) {
  const repository = useWorkspaceRepository();
  const queryClient = useQueryClient();
  const queryKey = workspaceQueryKeys.conversation(conversationId);

  return useMutation<string, Error, string, SendContext>({
    mutationFn: (content) => repository.sendMessage(conversationId, content.trim()),
    onMutate: async (rawContent) => {
      const content = rawContent.trim();
      await queryClient.cancelQueries({ queryKey });
      const current = queryClient.getQueryData<Conversation>(queryKey);
      if (!current) return {};

      const pending = appendPendingTurn(current, content);
      queryClient.setQueryData(queryKey, pending.conversation);
      return { assistantMessageId: pending.assistantMessageId };
    },
    onSuccess: (reply, _content, context) => {
      if (!context.assistantMessageId) return;
      queryClient.setQueryData<Conversation>(queryKey, (current) =>
        current
          ? resolvePendingTurn(current, context.assistantMessageId!, reply)
          : current,
      );
    },
    onError: (_error, _content, context) => {
      if (!context?.assistantMessageId) return;
      queryClient.setQueryData<Conversation>(queryKey, (current) =>
        current
          ? failPendingTurn(current, context.assistantMessageId!)
          : current,
      );
    },
  });
}

export function useAbortMessage(conversationId = workspaceData.conversation.id) {
  const repository = useWorkspaceRepository();
  const queryClient = useQueryClient();
  const queryKey = workspaceQueryKeys.conversation(conversationId);
  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!repository.abortMessage) throw new Error("当前会话不支持停止生成");
      await repository.abortMessage(conversationId);
    },
    onMutate: () => {
      queryClient.setQueryData<Conversation>(queryKey, (current) =>
        current ? stopPendingTurn(current) : current,
      );
    },
  });
}
