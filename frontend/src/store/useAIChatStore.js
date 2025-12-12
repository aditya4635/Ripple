import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAIChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      isTyping: false,

      sendMessage: async (messageData) => {
        const { messages } = get();
        // Add user message immediately
        set({
          messages: [...messages, { role: "user", text: messageData.text }],
          isTyping: true,
        });

        try {
          const res = await axiosInstance.post("/ai/chat", {
            message: messageData.text,
          });

          // Add AI response
          set({
            messages: [
              ...get().messages,
              { role: "model", text: res.data.response },
            ],
          });
        } catch (error) {
          toast.error(error.response?.data?.message || "Something went wrong");
          // Optionally remove the user message if it failed, or show error state
        } finally {
          set({ isTyping: false });
        }
      },

      clearChat: () => set({ messages: [] }),
      
      isAISelected: false,
      setIsAISelected: (value) => set({ isAISelected: value }),
    }),
    {
      name: "ai-chat-storage", // unique name
      partialize: (state) => ({ messages: state.messages }), // Only persist messages
    }
  )
);
