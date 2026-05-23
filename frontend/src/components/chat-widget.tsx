import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { aiApi, emailStorage, type AiMessage } from "@/lib/api";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      role: "assistant",
      content: "Hi! I'm **Aegis Assistant**. Ask me about your clients, policies, or claims.",
    },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: AiMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    try {
      const agentEmail = emailStorage.get() ?? undefined;
      const res = await aiApi.chat(next, agentEmail);
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e) {
      toast.error((e as Error).message ?? "Chat failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        data-testid="ai-chat-button"
        className={cn(
          "fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-xl",
          "ring-1 ring-primary/40",
        )}
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
      </button>

      <div
        data-testid="ai-chat-panel"
        className={cn(
          "fixed bottom-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-xl border bg-background/95 shadow-2xl backdrop-blur-md transition-all sm:max-w-md",
          open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0",
        )}
        style={{ height: "min(560px, calc(100svh - 6rem))" }}
      >
        <div className="flex items-center gap-2 border-b bg-gradient-to-r from-primary/10 to-transparent px-4 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold">Aegis Assistant</div>
            <div className="text-xs text-muted-foreground">AI · always on</div>
          </div>
        </div>

        <div ref={scrollRef} data-testid="ai-chat-messages" className="flex-1 space-y-3 overflow-y-auto p-3">
          {messages.map((m, i) => (
            <div
              key={i}
              data-testid={m.role === "user" ? "user-message" : "ai-message"}
              className={cn(
                "flex w-full",
                m.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3 py-2 text-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                )}
              >
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-1 prose-pre:my-1 prose-ul:my-1 prose-ol:my-1">
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        <div className="border-t p-2">
          <div className="flex items-end gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything…"
              rows={1}
              data-testid="ai-chat-input"
              className="min-h-[40px] max-h-32 resize-none"
            />
            <Button size="icon" onClick={send} disabled={isLoading || !input.trim()} data-testid="ai-chat-send">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
