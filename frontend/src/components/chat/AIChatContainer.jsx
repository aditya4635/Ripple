import { useState, useRef, useEffect } from "react";
import { useAIChatStore } from "../../stores/aiChatStore";
import { useChatStore } from "../../stores/chatStore";
import { Bot, Send, X, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

const AIChatContainer = () => {
  const { messages, sendMessage, isLoading, clearChat } = useAIChatStore();
  const { setAIChatSelected } = useChatStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const userMessage = input.trim();
    setInput("");
    await sendMessage(userMessage);
  };

  const handleClose = () => {
    setAIChatSelected(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="p-2.5 glass-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-base-content/10 shadow-md">
                <Bot className="size-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-base-content/90">AI Assistant</h3>
              <p className="text-sm text-base-content/70">
                {isLoading ? (
                  <span className="text-primary animate-pulse font-medium">Thinking...</span>
                ) : (
                  "Always helpful"
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={clearChat} className="btn btn-ghost btn-sm text-base-content/60 hover:text-error" title="Clear Chat">
              Clear
            </button>
            <button onClick={handleClose} className="hover:bg-base-200/60 p-2 rounded-full transition-all hover:rotate-90 duration-300 hover:scale-110">
              <X className="text-base-content/70" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-base-content/50 gap-3">
            <Bot className="size-16 text-primary/30" />
            <p className="text-lg font-medium">How can I help you today?</p>
            <p className="text-sm">Ask me anything!</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat ${message.role === "user" ? "chat-end" : "chat-start"} animate-slide-up mt-3`}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border border-base-300 overflow-hidden bg-base-200 shadow-sm">
                {message.role === "user" ? (
                  <div className="w-full h-full bg-secondary flex items-center justify-center text-secondary-content font-medium">
                    U
                  </div>
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Bot className="size-5 text-primary" />
                  </div>
                )}
              </div>
            </div>
            <div className={`chat-bubble ${
              message.role === "user"
                ? "message-bubble-sent"
                : "message-bubble-received"
            } bg-transparent p-0 shadow-none`}>
              <div className={`p-3 max-w-sm ${message.role === "user" ? "message-bubble-sent" : "message-bubble-received"}`}>
                {message.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none [&>p]:mb-2 [&>ul]:mb-2 [&>ol]:mb-2">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="leading-relaxed">{message.content}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="chat chat-start animate-slide-up mt-3">
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border border-base-300 overflow-hidden bg-base-200 shadow-sm">
                <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                  <Bot className="size-5 text-primary" />
                </div>
              </div>
            </div>
            <div className="chat-bubble bg-transparent p-0 shadow-none">
              <div className="p-3 message-bubble-received">
                <div className="flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-primary" />
                  <span className="text-sm text-base-content/60">Thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 w-full">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-full input-sm sm:input-md glass-input shadow-sm"
            placeholder="Ask the AI assistant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary btn-sm sm:btn-md btn-circle btn-premium shadow-md"
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatContainer;
