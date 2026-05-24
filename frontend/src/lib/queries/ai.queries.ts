import { useMutation } from "@tanstack/react-query";

import { aiApi, emailStorage, type AiMessage } from "@/lib/api";

export function useSendChatMessageMutation() {
  return useMutation({
    mutationFn: ({ messages }: { messages: AiMessage[] }) => {
      const agentEmail = emailStorage.get() ?? undefined;
      return aiApi.chat(messages, agentEmail);
    },
  });
}
