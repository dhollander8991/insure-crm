import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { clsx as cx } from "clsx";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { type AiMessage } from "@/lib/api";
import { useSendChatMessageMutation } from "@/lib/queries/ai.queries";

export function ChatWidget() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputText, setChatInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm **Aegis Assistant**. Ask me about your clients, policies, or claims.",
    },
  ]);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const sendChatMessageMutation = useSendChatMessageMutation();

  useEffect(() => {
    messagesScrollRef.current?.scrollTo({
      top: messagesScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [chatMessages, isChatOpen]);

  const sendChatMessage = async () => {
    const trimmedInput = chatInputText.trim();
    if (!trimmedInput || sendChatMessageMutation.isPending) return;

    const userMessage: AiMessage = { role: "user", content: trimmedInput };
    const messagesWithUserInput = [...chatMessages, userMessage];

    setChatMessages(messagesWithUserInput);
    setChatInputText("");

    try {
      const chatResponse = await sendChatMessageMutation.mutateAsync({
        messages: messagesWithUserInput,
      });
      setChatMessages((previousMessages) => [
        ...previousMessages,
        { role: "assistant", content: chatResponse.reply },
      ]);
    } catch (error) {
      toast.error((error as Error).message ?? "Chat failed. Please try again.");
    }
  };

  const handleTextareaKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendChatMessage();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsChatOpen((previousOpen) => !previousOpen)}
        aria-label={isChatOpen ? "Close chat" : "Open chat"}
        data-testid="ai-chat-button"
        className="chat-toggle-button bg-primary text-primary-foreground ring-1 ring-primary/40"
      >
        {isChatOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>

      <div
        data-testid="ai-chat-panel"
        className={cx(
          "chat-panel",
          isChatOpen
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <div className="flex items-center gap-2 border-b px-4 py-3 bg-gradient-to-r from-primary/10 to-transparent">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="chat-panel-title">Aegis Assistant</div>
            <div className="text-xs text-muted-foreground">AI · always on</div>
          </div>
        </div>

        <div
          ref={messagesScrollRef}
          data-testid="ai-chat-messages"
          className="chat-messages-area"
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              data-testid={
                message.role === "user" ? "user-message" : "ai-message"
              }
              className={cx(
                "chat-message-row",
                message.role === "user"
                  ? "chat-message-row--user"
                  : "chat-message-row--ai",
              )}
            >
              <div
                className={cx(
                  "chat-bubble",
                  message.role === "user"
                    ? "chat-bubble--user"
                    : "chat-bubble--ai",
                )}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-1 prose-ul:my-1 prose-ol:my-1">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {sendChatMessageMutation.isPending && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="chat-input-area">
          <div className="chat-input-row">
            <Textarea
              value={chatInputText}
              onChange={(event) => setChatInputText(event.target.value)}
              onKeyDown={handleTextareaKeyDown}
              placeholder="Ask anything…"
              rows={1}
              data-testid="ai-chat-input"
              className="min-h-[40px] max-h-32 resize-none"
            />
            <Button
              size="icon"
              onClick={sendChatMessage}
              disabled={
                sendChatMessageMutation.isPending || !chatInputText.trim()
              }
              data-testid="ai-chat-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
