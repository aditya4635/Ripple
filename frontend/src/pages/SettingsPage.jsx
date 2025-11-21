import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";
import { Send } from "lucide-react";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="h-screen container mx-auto px-4 pt-20 max-w-5xl">
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">Theme</h2>
          <p className="text-sm text-base-content/70">Choose a theme for your chat interface</p>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
          {THEMES.map((t) => (
            <button
              key={t}
              className={`
                group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors
                ${theme === t ? "bg-base-200" : "hover:bg-base-200/50"}
              `}
              onClick={() => setTheme(t)}
            >
              <div className="relative h-8 w-full rounded-md overflow-hidden" data-theme={t}>
                <div className="absolute inset-0 grid grid-cols-4 gap-px p-1">
                  <div className="rounded bg-primary"></div>
                  <div className="rounded bg-secondary"></div>
                  <div className="rounded bg-accent"></div>
                  <div className="rounded bg-neutral"></div>
                </div>
              </div>
              <span className="text-[11px] font-medium truncate w-full text-center">
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </span>
            </button>
          ))}
        </div>

        {/* Preview Section */}
        <h3 className="text-lg font-semibold mb-3">Preview</h3>
        <div className="rounded-xl border border-base-300 overflow-hidden bg-base-100 shadow-lg">
          <div className="p-4 bg-base-200">
            <div className="max-w-lg mx-auto">
              {/* Mock Chat UI */}
              <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden">
                {/* Chat Header - matches ChatHeader.jsx */}
                <div className="p-2.5 glass-header">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="avatar">
                        <div className="size-10 rounded-full border border-base-300 shadow-sm bg-primary flex items-center justify-center">
                          <span className="text-primary-content font-medium">J</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium text-base-content/90">John Doe</h3>
                        <p className="text-sm text-base-content/70">Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Messages - matches MessageBubble.jsx */}
                <div className="p-4 space-y-4 min-h-[300px] max-h-[300px] overflow-y-auto bg-base-100">
                  {/* Received message */}
                  <div className="chat chat-start animate-slide-up mt-4">
                    <div className="chat-image avatar">
                      <div className="size-10 rounded-full border border-base-300 overflow-hidden bg-base-200 shadow-sm">
                        <div className="w-full h-full bg-primary flex items-center justify-center text-primary-content font-medium">
                          J
                        </div>
                      </div>
                    </div>
                    <div className="chat-bubble bg-transparent p-0 shadow-none flex items-end gap-2">
                      <div className="flex flex-col p-3 max-w-sm message-bubble-received">
                        <p className="text-sm">Hey! How's it going?</p>
                        <time className="text-[10px] text-base-content/50 mt-1">12:00 PM</time>
                      </div>
                    </div>
                  </div>

                  {/* Sent message */}
                  <div className="chat chat-end animate-slide-up mt-4">
                    <div className="chat-image avatar">
                      <div className="size-10 rounded-full border border-base-300 overflow-hidden bg-base-200 shadow-sm">
                        <div className="w-full h-full bg-secondary flex items-center justify-center text-secondary-content font-medium">
                          Y
                        </div>
                      </div>
                    </div>
                    <div className="chat-bubble bg-transparent p-0 shadow-none flex items-end gap-2">
                      <div className="flex items-center gap-1 mb-1 shrink-0 self-end">
                        <div className="flex flex-col items-end">
                          <time className="text-[10px] text-base-content/50">12:02 PM</time>
                          <svg className="w-3 h-3 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13l4 4L23 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex flex-col p-3 max-w-sm message-bubble-sent">
                        <p className="text-sm">I'm doing great! Just working on some new features.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chat Input */}
                <div className="p-4 border-t border-base-300 bg-base-100">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="input input-bordered flex-1 text-sm h-10"
                      placeholder="Type a message..."
                      value="This is a preview"
                      readOnly
                    />
                    <button className="btn btn-primary h-10 min-h-0">
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
