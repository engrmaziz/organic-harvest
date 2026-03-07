"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Nectar 🌿, your Organic Harvest guide. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      const assistantContent =
        data.message ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantContent },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please contact us on WhatsApp at +92 300 0000000.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-80 h-96 flex flex-col rounded-xl shadow-2xl border border-[#D4AF37]/30 overflow-hidden bg-[#0B1C10] text-[#FDFBF7]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#D4AF37]/30 bg-[#0B1C10]">
            <span className="font-semibold text-sm text-[#D4AF37]">
              Nectar — Organic Harvest
            </span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="text-[#FDFBF7]/70 hover:text-[#FDFBF7] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "ml-auto bg-[#D4AF37]/20 text-[#FDFBF7]"
                    : "mr-auto text-[#FDFBF7]/90"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {isLoading && (
              <div className="mr-auto text-[#FDFBF7]/60 text-sm px-3 py-2">
                Nectar is typing…
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Footer */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 px-3 py-2 border-t border-[#D4AF37]/30 bg-[#0B1C10]"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask me anything…"
              className="flex-1 bg-[#0B1C10]/80 border border-[#D4AF37]/30 rounded-lg px-3 py-2 text-sm text-[#FDFBF7] placeholder-[#FDFBF7]/40 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
              className="flex-shrink-0 bg-[#D4AF37] text-[#0B1C10] rounded-lg p-2 hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Close chat" : "Open Nectar chat"}
        className="w-14 h-14 rounded-full bg-[#D4AF37] text-[#0B1C10] flex items-center justify-center shadow-lg hover:bg-[#D4AF37]/90 transition-colors"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}
