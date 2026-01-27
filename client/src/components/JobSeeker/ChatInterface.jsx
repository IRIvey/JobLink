import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  ShieldAlert,
  Send,
  MessageSquare,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5001";

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "TC",
      text: "Are you free for an interview next Tuesday at 2 PM?",
      isMe: false,
    },
  ]);

  const messagesEndRef = useRef(null);
  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (text) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), text, isMe: true }]);
    setInput("");
  };

  const callGemini = async (promptType) => {
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/ai/gemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // If you have JWT auth for this route, uncomment:
          // Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          promptType,
          messages, // send chat history
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "AI request failed");
      }

      const text = (data.text || "").trim();

      if (promptType === "suggest") {
        setInput(text.replace(/"/g, "").trim());
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now(),
            text: `🛡️ AI Analysis: ${text}`,
            isMe: false,
            isSystem: true,
          },
        ]);
      }
    } catch (err) {
      setError(err.message || "Failed to connect to server");
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[700px] bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
      {/* Sidebar */}
      <div className="w-80 border-r bg-white/60 backdrop-blur-sm hidden md:flex flex-col">
        <div className="p-6 border-b font-bold flex items-center gap-2">
          <MessageSquare size={18} /> Chat History
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <div className="p-4 border-b bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
              TC
            </div>
            <h3 className="font-bold text-slate-900">TechCorp Recruiter</h3>
          </div>
          {error && (
            <div className="text-red-500 text-xs flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.isSystem
                    ? "bg-amber-50 border border-amber-200 text-amber-800"
                    : msg.isMe
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="text-xs text-indigo-500 animate-pulse flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> AI is generating...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input & AI Actions */}
        <div className="p-4 border-t">
          <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
            <button
              onClick={() => callGemini("suggest")}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
            >
              <Sparkles size={14} /> Draft with AI
            </button>
            <button
              onClick={() => callGemini("detect")}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-medium hover:bg-slate-100 transition-colors"
            >
              <ShieldAlert size={14} /> Scan Scam
            </button>
          </div>

          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Write a message..."
              className="flex-1 px-4 py-2 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            <button
              onClick={() => handleSend(input)}
              className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
