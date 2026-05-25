import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BrainCircuit, Mic, Volume2, VolumeX, Sparkles } from "lucide-react";
import { Farm, ChatMessage } from "../types";

interface AIChatbotProps {
  farm: Farm;
}

export default function AIChatbot({ farm }: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init_msg",
      role: "assistant",
      content: `Kính chào bà con nông dân và các kỹ sư! Tôi là Chuyên Gia Đồng Ruộng Trí Tuệ Nhân Tạo Smart Rice AI. 🌾\n\nTôi đã liên kết thành công với cảm biến dã ngoại của **${farm.name}**.\n\nHãy đặt bất kỳ câu hỏi nào về bón phân NPK đón đồng, tháo xả nước cho giống lúa mùa, hoặc chẩn trị sâu bệnh rầy nâu đạo ôn lúa. Tôi rất vui lòng được đồng hành cùng bà con!`,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `${Date.now()}_user`,
      role: "user",
      content: inputVal,
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-6), // Send last 6 messages as summary context
          farmContext: farm
        })
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `${Date.now()}_ai`,
        role: "assistant",
        content: data.response || "Xin lỗi nông dân, hệ thống xử lý dữ liệu gặp tí sự cố kỹ thuật.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("Chat fetch fail:", err);
      const errMsg: ChatMessage = {
        id: `${Date.now()}_ai_err`,
        role: "assistant",
        content: "Hệ thống gặp lỗi kết nối. Hãy đảm bảo bón thúc đón đồng đạm kali đúng kỹ thuật trong giai đoạn lúa nhạy cảm đè nhánh.",
        timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  // 2. High-fidelity Vietnamese TTS voice assistant synthesis
  const toggleSpeak = (text: string, msgId: string) => {
    if ("speechSynthesis" in window) {
      if (isSpeaking === msgId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }

      window.speechSynthesis.cancel(); // cancel any active readings
      
      // Remove symbols and markdown for clean listening
      const cleanText = text
        .replace(/[🌾*#-]/g, "")
        .replace(/\n+/g, ", ");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = "vi-VN";
      
      utterance.onend = () => {
        setIsSpeaking(null);
      };
      utterance.onerror = () => {
        setIsSpeaking(null);
      };

      setIsSpeaking(msgId);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Hệ thống trình duyệt của bạn chưa nâng cấp để chạy trợ lý audio Tiếng Việt.");
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm h-[600px] flex flex-col justify-between overflow-hidden">
      {/* Bot Chat Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-950/30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-green-500 to-blue-500 p-0.5 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
              <Bot className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center space-x-1">
              <span>Chuyên Gia Đồng Ruộng AI Tiếng Việt</span>
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-green-400 font-mono">Bối cảnh: {farm.name}</p>
          </div>
        </div>

        {/* Info Capsule */}
        <div className="text-[10px] bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-xl border border-emerald-500/10 font-bold uppercase font-mono tracking-wide">
          TTS Voice Active
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/20">
        {messages.map((msg) => {
          const isAI = msg.role === "assistant";
          return (
            <div 
              key={msg.id}
              className={`flex items-start gap-3 max-w-[85%] ${isAI ? "self-start" : "ml-auto flex-row-reverse"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                isAI ? "bg-slate-150 dark:bg-slate-800 text-slate-600 dark:text-emerald-400" : "bg-emerald-500 text-slate-900 font-extrabold"
              }`}>
                {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className="space-y-1">
                <div className={`p-4 rounded-3xl text-xs leading-relaxed whitespace-pre-wrap ${
                  isAI 
                    ? "bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 text-slate-700 dark:text-slate-205 rounded-tl-sm shadow-sm" 
                    : "bg-emerald-600 text-white rounded-tr-sm font-medium shadow-md shadow-emerald-500/5"
                }`}>
                  {msg.content}
                </div>

                <div className={`flex items-center space-x-2 text-[9px] text-slate-400 font-mono ${!isAI && "justify-end"}`}>
                  <span>{msg.timestamp}</span>
                  {isAI && (
                    <button
                      onClick={() => toggleSpeak(msg.content, msg.id)}
                      className="text-emerald-500 hover:text-emerald-400 font-bold cursor-pointer flex items-center space-x-1"
                      title="Phát hoặc dừng tiếng đọc lúa"
                    >
                      {isSpeaking === msg.id ? (
                        <>
                          <VolumeX className="w-3 h-3 text-rose-500" />
                          <span>Dừng đọc</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" />
                          <span>Đọc râm ran</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-3 max-w-[80%]">
            <div className="w-8 h-8 rounded-full bg-slate-150 dark:bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/65 p-4 rounded-2xl rounded-tl-sm text-xs text-slate-400 flex items-center space-x-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-medium">Chuyên gia AI đang suy nghĩ nông nghiệp lý thuyết...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input panel Form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/40 flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          disabled={loading}
          placeholder="Lúa nẩy mầm yếu bón NPK gì? Hỏi về rầy nâu, ngập úng..."
          className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 text-xs border border-slate-150 dark:border-slate-800 rounded-xl dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!inputVal.trim() || loading}
          className="p-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-900 rounded-xl cursor-pointer transition-all flex items-center justify-center font-bold"
        >
          <Send className="w-4 h-4 text-slate-900" />
        </button>
      </form>
    </div>
  );
}
