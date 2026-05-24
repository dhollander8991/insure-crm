import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

import styles from "./ChatWidget.module.css";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
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
        className={cn(styles.toggleButton, "ring-1 ring-primary/40")}
      >
        {isChatOpen ? (
          <X className="h-5 w-5" />
        ) : (
          <MessageCircle className="h-5 w-5" />
        )}
      </button>

      <div
        data-testid="ai-chat-panel"
        className={cn(
          styles.chatPanel,
          isChatOpen ? styles.chatPanelOpen : styles.chatPanelClosed,
        )}
      >
        <div className={styles.chatHeader}>
          <div className={styles.chatHeaderAvatar}>
            <Sparkles className="h-4 w-4" />
          </div>
          <div className={styles.chatHeaderTextWrapper}>
            <div className={styles.chatHeaderTitle}>Aegis Assistant</div>
            <div className={styles.chatHeaderSubtitle}>AI · always on</div>
          </div>
        </div>

        <div
          ref={messagesScrollRef}
          data-testid="ai-chat-messages"
          className={styles.messagesArea}
        >
          {chatMessages.map((message, index) => (
            <div
              key={index}
              data-testid={
                message.role === "user" ? "user-message" : "ai-message"
              }
              className={cn(
                styles.messageRow,
                message.role === "user"
                  ? styles.messageRowUser
                  : styles.messageRowAssistant,
              )}
            >
              <div
                className={cn(
                  styles.messageBubble,
                  message.role === "user"
                    ? styles.messageBubbleUser
                    : styles.messageBubbleAssistant,
                )}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-1 prose-ul:my-1 prose-ol:my-1">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {sendChatMessageMutation.isPending && (
            <div className={styles.loadingBubble}>
              <div className={styles.loadingIndicator}>
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className={styles.inputArea}>
          <div className={styles.inputRow}>
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
