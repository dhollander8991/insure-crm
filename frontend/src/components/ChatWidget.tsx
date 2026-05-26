import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

import styles from "./widgets.module.css";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { type AiMessage } from "@/lib/api";
import { useSendChatMessageMutation } from "@/lib/queries/ai.queries";

export function ChatWidget() {
  const { t } = useTranslation();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInputText, setChatInputText] = useState("");
  const [chatMessages, setChatMessages] = useState<AiMessage[]>([]);
  const greeting = t("ai.greeting");

  const allMessages: AiMessage[] = chatMessages.length === 0 || chatMessages[0]?.role !== "assistant"
    ? [{ role: "assistant", content: greeting }, ...chatMessages]
    : chatMessages;
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  const sendChatMessageMutation = useSendChatMessageMutation();

  useEffect(() => {
    messagesScrollRef.current?.scrollTo({
      top: messagesScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [allMessages, isChatOpen]);

  const sendChatMessage = async () => {
    const trimmedInput = chatInputText.trim();
    if (!trimmedInput || sendChatMessageMutation.isPending) return;

    const userMessage: AiMessage = { role: "user", content: trimmedInput };
    const messagesWithUserInput = [...allMessages, userMessage];

    setChatMessages(messagesWithUserInput);
    setChatInputText("");

    try {
      const chatResponse = await sendChatMessageMutation.mutateAsync({
        messages: messagesWithUserInput,
      });
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: chatResponse.reply },
      ]);
    } catch (error) {
      toast.error((error as Error).message ?? t("ai.errorMessage"));
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
        aria-label={isChatOpen ? t("ai.close") : t("ai.open")}
        data-testid="ai-chat-button"
        className={styles.toggleButton}
      >
        {isChatOpen ? (
          <X className={styles.iconLg} />
        ) : (
          <MessageCircle className={styles.iconLg} />
        )}
      </button>

      <div
        data-testid="ai-chat-panel"
        data-state={isChatOpen ? "open" : "closed"}
        className={clsx(
          styles.panel,
          isChatOpen ? styles.panelOpen : styles.panelClosed,
        )}
      >
        <div className={styles.panelHeader}>
          <div className={styles.panelAvatar}>
            <Sparkles className={styles.iconMd} />
          </div>
          <div className={styles.panelTitleGroup}>
            <div className={styles.panelTitle}>Aegis Assistant</div>
            <div className={styles.panelStatus}>AI · always on</div>
          </div>
        </div>

        <div
          ref={messagesScrollRef}
          data-testid="ai-chat-messages"
          className={styles.messagesArea}
        >
          {allMessages.map((message, index) => (
            <div
              key={index}
              data-testid={
                message.role === "user" ? "user-message" : "ai-message"
              }
              className={clsx(
                styles.messageRow,
                message.role === "user"
                  ? styles.messageRowUser
                  : styles.messageRowAi,
              )}
            >
              <div
                className={clsx(
                  styles.bubble,
                  message.role === "user" ? styles.bubbleUser : styles.bubbleAi,
                )}
              >
                <div className={styles.bubbleContent}>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {sendChatMessageMutation.isPending && (
            <div className={styles.chatLoadingRow} data-testid="ai-chat-loading">
              <div className={styles.loadingBubble}>
                <Loader2 className={`${styles.chatSpinner} animate-spin`} />
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
              placeholder={t("ai.placeholder")}
              rows={1}
              data-testid="ai-chat-input"
              className={styles.textarea}
            />
            <Button
              size="icon"
              onClick={sendChatMessage}
              disabled={
                sendChatMessageMutation.isPending || !chatInputText.trim()
              }
              data-testid="ai-chat-send"
              aria-label={t("ai.send")}
            >
              <Send className={styles.iconMd} />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
