import { create } from "zustand";
import { aiApi } from "../api/index.js";
import toast from "react-hot-toast";

export const useAIChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,

  sendMessage: async (message) => {
    const userMessage = { role: "user", content: message };
    set({ messages: [...get().messages, userMessage], isLoading: true });

    try {
      const data = await aiApi.chat(message);
      const aiMessage = { role: "assistant", content: data.reply };
      set({ messages: [...get().messages, aiMessage] });
    } catch (error) {
      toast.error(error.message);
      set({
        messages: [
          ...get().messages,
          { role: "assistant", content: "Sorry, I encountered an error." },
        ],
      });
    } finally {
      set({ isLoading: false });
    }
  },

  clearChat: () => set({ messages: [] }),
  clearMessages: () => set({ messages: [] }),
}));
