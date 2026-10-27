import { useEffect, useRef, useState } from "react";
import { Bot, X, Send, Sparkles, RefreshCw } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { aiApi } from "../services/hcmServices.js";
import { ROLES } from "../utils/roles.js";

const FALLBACK_REPLY = "I could not process your query at this moment.";

// Works whether aiApi.chat returns the axios response, the response body,
// or the already-unwrapped data object.
// Backend body shape: { success, message, data: { answer, aiGenerated, tool, latencyMs } }
function extractReply(res) {
  const payload = res?.data?.data ?? res?.data ?? res;
  const text =
    payload?.answer ??
    payload?.reply ??
    payload?.response ??
    (typeof payload === "string" ? payload : null);
  return typeof text === "string" && text.trim() ? text : FALLBACK_REPLY;
}

export default function AiAssistantDrawer() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hello ${user?.name || ""}! I'm your HCM AI Assistant. You can ask me about company policies, leave balances, attendance, or payroll in English or Roman Urdu.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (open) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Role-specific suggested prompt chips
  const suggestions =
    user?.role === ROLES.EMPLOYEE
      ? [
          "How many sick leaves do I have left?",
          "What is our office timing and grace period?",
          "Mera is maheene ka attendance record kaisa hai?",
          "When will this month payslip be generated?",
        ]
      : user?.role === ROLES.HR
        ? [
            "Who came late most this month?",
            "Show me attendance summary for today",
            "How many pending leave requests are there?",
            "Kis department ki absenteeism sab se zyada hai?",
          ]
        : [
            "Summarize current headcount and monthly payroll cost",
            "What are the key attendance anomalies this week?",
            "Which department has the highest attrition risk?",
            "How many active employees joined this year?",
          ];

  const handleSend = async (textToSend) => {
    const text = (typeof textToSend === "string" ? textToSend : input).trim();
    if (!text || loading) return;

    const userMsg = { role: "user", content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setLoading(true);

    try {
      // Backend expects: POST /api/ai/chat { message, history }
      const apiHistory = messages
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await aiApi.chat(text, apiHistory);
      const reply = extractReply(res);

      setMessages([...newHistory, { role: "assistant", content: reply }]);
    } catch (err) {
      const status = err.response?.status;
      const errMsg =
        status === 429
          ? "Assistant is busy (Rate limit reached). Please wait a moment and try again."
          : "Assistant timed out or unavailable. Please try again.";
      setMessages([
        ...newHistory,
        { role: "assistant", content: errMsg, isError: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-teal-500 p-3.5 sm:px-5 sm:py-3.5 text-white shadow-lg hover:shadow-indigo-500/25 transition-all transform hover:-translate-y-0.5 active:scale-95"
        aria-label="Open AI Assistant"
      >
        <Sparkles className="h-5 w-5 animate-pulse" />
        <span className="hidden sm:inline font-semibold text-sm">Ask AI</span>
      </button>

      {/* Side drawer / modal */}
      {open && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setOpen(false)}
          />

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4 bg-slate-50/70 dark:bg-slate-900/60">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-teal-500 text-white shadow-sm">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                      HCM Assistant
                      <span className="rounded-full bg-teal-100 dark:bg-teal-950/80 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:text-teal-400">
                        AI
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Policy Q&A • Attendance • Payroll
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setMessages([
                        {
                          role: "assistant",
                          content: `Chat cleared. How can I help you today, ${user?.name || ""}?`,
                        },
                      ])
                    }
                    title="Clear chat"
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-3 text-sm ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                        <Bot className="h-4 w-4" />
                      </div>
                    )}
                    <div
                      className={`max-w-[82%] rounded-2xl px-4 py-3 ${
                        m.role === "user"
                          ? "bg-indigo-600 text-white rounded-tr-xs"
                          : m.isError
                            ? "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 rounded-tl-xs"
                            : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-700/50 rounded-tl-xs"
                      }`}
                    >
                      <div className="whitespace-pre-wrap leading-relaxed text-[13px]">
                        {m.content}
                      </div>
                      {m.role === "assistant" && !m.isError && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
                          <Sparkles className="h-3 w-3 text-teal-500" />
                          <span>AI-generated • Verify critical data</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 text-sm justify-start">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600">
                      <Bot className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="rounded-2xl rounded-tl-xs bg-slate-100 dark:bg-slate-800/80 px-4 py-3 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                        <span className="ml-2 text-xs text-slate-500">
                          Thinking...
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions Chips */}
              <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Suggestions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSend(s)}
                      disabled={loading}
                      className="text-left text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-1.5 rounded-lg hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask in English or Roman Urdu..."
                  disabled={loading}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="rounded-xl bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:opacity-40 transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
