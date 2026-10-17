import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User, Loader2 } from "lucide-react";
import { ChatMessage, StudyGuide } from "../types";

interface AiHelperDrawerProps {
  currentGuide: StudyGuide | null;
}

export const AiHelperDrawer: React.FC<AiHelperDrawerProps> = ({ currentGuide }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial",
      role: "assistant",
      text: "สวัสดีครับ! I am Your AI Helper for Fast Read. Ask me anything about your current 1-hour study topic, grammar points, or quiz questions!",
      time: "Just now",
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (customPrompt?: string) => {
    const questionText = customPrompt || input.trim();
    if (!questionText || isLoading) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      text: questionText,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/study/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          currentTopic: currentGuide ? currentGuide.title : "Language & Learning",
          targetLanguage: currentGuide?.targetLanguage,
          contextData: currentGuide
            ? {
                title: currentGuide.title,
                summary: currentGuide.conciseSummary,
                keyItems: currentGuide.keyItems,
                pitfalls: currentGuide.commonPitfalls,
              }
            : {},
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get answer from AI Helper");
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: data.reply || "I am ready to help you with your 1-hour fast study session!",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      const fallbackText = currentGuide?.targetLanguage === "zh"
        ? "对不起，暂时未能连接到AI，建议回顾当前课程的要点与规则解析。"
        : currentGuide?.targetLanguage === "en"
        ? "Sorry, connection is momentarily limited. Please review the 1-hour study notes above."
        : "ขออภัยครับ ขณะนี้ระบบตอบคำถามกำลังประมวลผล แนะนำให้อ่านทบทวนกฎทองในหน้าสรุปเนื้อหาด้านบนครับ";
      const errorMsg: ChatMessage = {
        id: String(Date.now() + 1),
        role: "assistant",
        text: fallbackText,
        time: "Now",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = currentGuide?.targetLanguage === "zh"
    ? [
        "请再给出两个日常实用例句",
        "初学者最容易在哪个考点犯错？",
        "用一句话总结最核心的记忆口诀",
      ]
    : currentGuide?.targetLanguage === "en"
    ? [
        "Give 2 more everyday example sentences",
        "Why do test-takers confuse this rule?",
        "1-sentence golden memory rule",
      ]
    : [
        "ยกตัวอย่างประโยคเพิ่มอีก 2 ประโยค (Give 2 more examples)",
        "ทำไมคนส่วนใหญ่ถึงจำสับสน? (Why do people confuse this?)",
        "ช่วยสรุปเทคนิคจำใน 1 ประโยค (1-sentence memory trick)",
      ];

  return (
    <>
      {/* Floating Chat Bubble Button matching wireframe Image 1 bottom-right icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open AI Helper"
        className="fixed bottom-6 right-6 z-50 p-4 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all cursor-pointer flex items-center justify-center active:scale-95 group"
      >
        <MessageSquare className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
        <span className="sr-only">Your AI Helper</span>
      </button>

      {/* Slide-over Drawer / Modal */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold text-xs">
                AI
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">Your AI Helper</div>
                <div className="text-[11px] text-slate-400">
                  {currentGuide ? currentGuide.title.slice(0, 24) + "..." : "1-Hour Study Coach"}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.role === "user" ? "text-slate-400 text-right" : "text-slate-400"
                    }`}
                  >
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-500 text-xs pl-2">
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                <span>AI Helper is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 border-t border-slate-100 bg-white flex flex-col gap-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2">
              Quick Inquiries:
            </span>
            <div className="flex flex-wrap gap-1">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(qp)}
                  disabled={isLoading}
                  className="text-[11px] text-left p-1.5 px-2 bg-slate-50 hover:bg-red-50 text-slate-700 hover:text-red-700 border border-slate-200 rounded-lg transition-colors cursor-pointer truncate max-w-full"
                >
                  {qp}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-slate-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask your AI Helper..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-red-500"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
