import { useAIChatStore } from "../store/useAIChatStore";
import { useEffect, useRef } from "react";
import { Bot, Send, Loader2 } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

const AIChatContainer = () => {
  const { messages, isTyping, sendMessage } = useAIChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const text = inputRef.current.value.trim();
    if (!text) return;

    inputRef.current.value = "";
    await sendMessage({ text });
  };

  return (
    <div className="flex-1 flex flex-col overflow-auto backdrop-blur-[2px] relative" style={{backgroundColor: 'hsl(var(--b1) / 0.7)'}}>
      {/* Header */}
      <div className="p-2.5 border-b border-base-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="size-10 rounded-full relative bg-primary/10 flex items-center justify-center">
                <Bot className="size-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-medium">Gemini AI</h3>
              <p className="text-xs text-base-content/70">Always helpful</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat ${message.role === "user" ? "chat-end" : "chat-start"}`}
            ref={index === messages.length - 1 ? messageEndRef : null}
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                {message.role === "user" ? (
                  <img
                    src={authUser.profilePic || "/avatar.png"}
                    alt="profile pic"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <Bot className="size-6 text-primary" />
                  </div>
                )}
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </time>
            </div>
            {message.role === "user" ? (
                <div className="chat-bubble flex flex-col bg-primary text-primary-content">
                  {message.text}
                </div>
              ) : (
                <div className="chat-bubble flex flex-col bg-base-200 text-base-content max-w-[80%] markdown-content text-sm">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      table: ({node, ...props}) => (
                        <div className="overflow-x-auto my-2 border rounded-lg border-base-content/10">
                          <table {...props} className="table table-xs sm:table-sm w-full" />
                        </div>
                      )
                    }}
                  >
                    {message.text || ""}
                  </ReactMarkdown>
                </div>
              )}
          </div>
        ))}

        {isTyping && (
          <div className="chat chat-start" ref={messageEndRef}>
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border bg-primary/10 flex items-center justify-center">
                <Bot className="size-6 text-primary" />
              </div>
            </div>
            <div className="chat-bubble bg-base-200 text-base-content">
              <Loader2 className="size-5 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 w-full">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <input
            type="text"
            className="input input-bordered w-full input-sm sm:input-md"
            placeholder="Ask Gemini anything..."
            ref={inputRef}
          />
          <button
            type="submit"
            className="btn btn-sm sm:btn-md btn-circle btn-primary"
            disabled={isTyping}
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatContainer;
