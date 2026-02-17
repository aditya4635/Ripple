import { create } from "zustand";
import { messageApi } from "../api/index.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./authStore.js";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  typingUsers: {},
  isAIChatSelected: false,
  selectedMessages: [],
  isSelectionMode: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const data = await messageApi.getUsers();
      set({ users: data });
    } catch (error) {
      toast.error(error.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const data = await messageApi.getMessages(userId);
      set({ messages: data });
    } catch (error) {
      toast.error(error.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const newMessage = await messageApi.sendMessage(
        selectedUser._id,
        messageData
      );
      set({ messages: [...messages, newMessage] });
    } catch (error) {
      toast.error(error.message);
    }
  },

  markAsRead: async (userId) => {
    try {
      await messageApi.markAsRead(userId);
    } catch {
      // Silent fail for read receipts
    }
  },

  deleteMessage: async (messageId, deleteType) => {
    try {
      const result = await messageApi.deleteMessage(messageId, deleteType);

      set({
        messages: get().messages.map((msg) =>
          msg._id === messageId
            ? deleteType === "everyone"
              ? result
              : { ...msg, _hidden: true }
            : msg
        ),
      });

      if (deleteType === "me") {
        set({
          messages: get().messages.filter((msg) => msg._id !== messageId),
        });
      }

      toast.success("Message deleted");
    } catch (error) {
      toast.error(error.message);
    }
  },

  deleteSelectedMessages: async (deleteType) => {
    const { selectedMessages } = get();
    try {
      await Promise.all(
        selectedMessages.map((id) => messageApi.deleteMessage(id, deleteType))
      );

      if (deleteType === "me") {
        set({
          messages: get().messages.filter(
            (msg) => !selectedMessages.includes(msg._id)
          ),
        });
      } else {
        const updatedMessages = get().messages.map((msg) =>
          selectedMessages.includes(msg._id)
            ? { ...msg, isDeleted: true, text: "This message was deleted", image: null }
            : msg
        );
        set({ messages: updatedMessages });
      }

      set({ selectedMessages: [], isSelectionMode: false });
      toast.success("Messages deleted");
    } catch (error) {
      toast.error(error.message);
    }
  },

  deleteChatHistory: async (userId) => {
    try {
      await messageApi.deleteChatHistory(userId);
      set({ messages: [] });
      toast.success("Chat history cleared");
    } catch (error) {
      toast.error(error.message);
    }
  },

  setSelectedUser: (user) => {
    set({
      selectedUser: user,
      isAIChatSelected: false,
      selectedMessages: [],
      isSelectionMode: false,
    });
  },

  setAIChatSelected: (selected) => {
    set({
      isAIChatSelected: selected,
      selectedUser: selected ? null : get().selectedUser,
    });
  },

  toggleMessageSelection: (messageId) => {
    const { selectedMessages } = get();
    if (selectedMessages.includes(messageId)) {
      const newSelection = selectedMessages.filter((id) => id !== messageId);
      set({
        selectedMessages: newSelection,
        isSelectionMode: newSelection.length > 0,
      });
    } else {
      set({
        selectedMessages: [...selectedMessages, messageId],
        isSelectionMode: true,
      });
    }
  },

  clearSelection: () => {
    set({ selectedMessages: [], isSelectionMode: false });
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (isFromSelectedUser) {
        set({ messages: [...get().messages, newMessage] });
      }
    });

    socket.on("messageDeleted", ({ messageId, deleteType, message }) => {
      if (deleteType === "everyone") {
        set({
          messages: get().messages.map((msg) =>
            msg._id === messageId ? message : msg
          ),
        });
      }
    });

    socket.on("messagesRead", ({ readBy }) => {
      if (readBy === selectedUser._id) {
        set({
          messages: get().messages.map((msg) => ({ ...msg, isRead: true })),
        });
      }
    });

    socket.on("userTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        set({ typingUsers: { ...get().typingUsers, [userId]: true } });
      }
    });

    socket.on("userStoppedTyping", ({ userId }) => {
      if (userId === selectedUser._id) {
        const newTyping = { ...get().typingUsers };
        delete newTyping[userId];
        set({ typingUsers: newTyping });
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("messageDeleted");
    socket.off("messagesRead");
    socket.off("userTyping");
    socket.off("userStoppedTyping");
  },
}));
