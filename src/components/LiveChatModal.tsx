import React, { useState, useEffect, useRef } from "react";
import { X, Send, PhoneCall, ShieldCheck, CheckCheck, UserCheck, MessageSquare } from "lucide-react";
import { MatchRecord, ChatMessage } from "../types";

interface LiveChatModalProps {
  match: MatchRecord;
  onClose: () => void;
}

export const LiveChatModal: React.FC<LiveChatModalProps> = ({ match, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [activeSenderRole, setActiveSenderRole] = useState<"provider" | "receiver">("provider");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/chat/${match.id}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.error("Chat polling error", e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2500);
    return () => clearInterval(interval);
  }, [match.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (customText?: string) => {
    const text = (customText || inputMessage).trim();
    if (!text) return;

    const senderName = activeSenderRole === "provider" ? match.providerName : match.receiverName;
    const senderId = activeSenderRole === "provider" ? match.providerId : match.receiverId;

    setIsSending(true);
    try {
      const res = await fetch(`/api/chat/${match.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId,
          senderName,
          senderRole: activeSenderRole,
          text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInputMessage("");
        fetchMessages();
      }
    } catch (e) {
      console.error("Error sending message", e);
    } finally {
      setIsSending(false);
    }
  };

  // Common rural quick reply prompts
  const quickReplies = [
    "📍 What is the closest landmark or main road?",
    "🚜 I have started from my location and will arrive in 15 minutes.",
    "🍱 The food packages are fresh and packed safely in trays.",
    "💧 The water pump and tools are loaded in the transport vehicle.",
    "🙏 Thank you so much for the quick community support!",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        {/* Chat Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {match.providerName} ↔ {match.receiverName}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
                  {match.category} Help
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                <span>Distance ~{match.distanceKm} km</span>
                <span>•</span>
                <span className="text-emerald-600 font-medium">Real-time Connected</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <a
              href={`tel:${match.providerPhone}`}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-200/70 transition-colors"
              title="Call"
            >
              <PhoneCall className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sender Role Switcher (Allows testing from both perspectives) */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium flex items-center space-x-1">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Chatting as:</span>
          </span>
          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSenderRole("provider")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSenderRole === "provider"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Provider ({match.providerName.split(" ")[0]})
            </button>
            <button
              onClick={() => setActiveSenderRole("receiver")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeSenderRole === "receiver"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Receiver ({match.receiverName.split(" ")[0]})
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {messages.map((msg) => {
            const isSystem = msg.senderRole === "system";
            const isMe = msg.senderRole === activeSenderRole;

            if (isSystem) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <div className="inline-block px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                    {msg.text}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <span className="text-[10px] text-slate-400 font-semibold mb-1 px-1">
                  {msg.senderName} ({msg.senderRole === "provider" ? "Provider" : "Receiver"})
                </span>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isMe
                      ? "bg-emerald-600 text-white rounded-tr-xs shadow-xs"
                      : "bg-white text-slate-900 border border-slate-200 rounded-tl-xs shadow-xs"
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <div className="flex items-center space-x-1 text-[10px] text-slate-400 mt-1 px-1">
                  <span>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 text-emerald-500" />}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Rural Assistance Prompts */}
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto text-[11px] no-scrollbar">
          <span className="text-slate-400 font-bold shrink-0">Quick:</span>
          {quickReplies.map((qr, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(qr)}
              className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Message Input Box */}
        <div className="p-3 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={`Message as ${activeSenderRole}...`}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center space-x-1 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
