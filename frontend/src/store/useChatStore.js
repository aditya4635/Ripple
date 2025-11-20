

import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  messageListener: null,
  unreadListener: null,
  messagesReadListener: null,
  typingListener: null,
  stopTypingListener: null,
  typingUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  markMessagesAsRead: async (id) => {
    try {
      await axiosInstance.put(`/messages/${id}/read`);
      set((state) => ({
        users: state.users.map((user) =>
          user._id === id ? { ...user, unreadCount: 0 } : user
        ),
      }));
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  deleteMessage: async (messageId, type) => {
    const { messages } = get();
    try {
      await axiosInstance.delete(`/messages/${messageId}?type=${type}`);
      
      if (type === "me") {
        set({ messages: messages.filter((message) => message._id !== messageId) });
      } else {
        // Optimistic update for "everyone"
        set({
          messages: messages.map((message) => 
            message._id === messageId 
              ? { ...message, isDeleted: true, text: "This message was deleted", image: null } 
              : message
          )
        });
      }
      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    // Optimize: Remove existing listener if any to prevent duplicates
    const existingListener = get().messageListener;
    if (existingListener) {
      socket.off("newMessage", existingListener);
    }

    const messageListener = (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
      
      // Mark as read immediately if the user is looking at the chat
      get().markMessagesAsRead(newMessage.senderId);
    };

    socket.on("newMessage", messageListener);

    socket.on("messageDeleted", ({ messageId, type }) => {
      const { messages } = get();
      if (type === "me") {
        set({ messages: messages.filter((message) => message._id !== messageId) });
      } else {
        set({
          messages: messages.map((message) => 
            message._id === messageId 
              ? { ...message, isDeleted: true, text: "This message was deleted", image: null } 
              : message
          )
        });
      }
    });

    set({ messageListener });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const messageListener = get().messageListener;
    if (messageListener) {
      socket.off("newMessage", messageListener);
      socket.off("messageDeleted");
      set({ messageListener: null });
    }
  },

  subscribeToUnreadMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    // Optimize: Remove existing listener if any before adding new ones
    const { unreadListener: existingUnreadListener, messagesReadListener: existingMessagesReadListener } = get();
    if (existingUnreadListener) {
      socket.off("newMessage", existingUnreadListener);
    }
    if (existingMessagesReadListener) {
      socket.off("messagesRead", existingMessagesReadListener);
    }

    const unreadListener = (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === get().selectedUser?._id;
      if (isMessageSentFromSelectedUser) return;

      set((state) => ({
        users: state.users.map((user) =>
          user._id === newMessage.senderId ? { ...user, unreadCount: (user.unreadCount || 0) + 1 } : user
        ),
      }));
    };

    const messagesReadListener = ({ conversationId }) => {
      const { selectedUser, messages } = get();
      if (selectedUser && selectedUser._id === conversationId) {
        set({
          messages: messages.map((msg) => ({ ...msg, isRead: true })),
        });
      }
    };

    socket.on("newMessage", unreadListener);
    socket.on("messagesRead", messagesReadListener);

    set({ unreadListener, messagesReadListener });
  },

  unsubscribeFromUnreadMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { unreadListener, messagesReadListener } = get();
    if (unreadListener) socket.off("newMessage", unreadListener);
    if (messagesReadListener) socket.off("messagesRead", messagesReadListener);
    
    set({ unreadListener: null, messagesReadListener: null });
  },

  subscribeToTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const typingListener = ({ senderId }) => {
      set((state) => ({
        typingUsers: [...state.typingUsers, senderId],
      }));
    };

    const stopTypingListener = ({ senderId }) => {
      set((state) => ({
        typingUsers: state.typingUsers.filter((id) => id !== senderId),
      }));
    };

    socket.on("typing", typingListener);
    socket.on("stopTyping", stopTypingListener);

    set({ typingListener, stopTypingListener });
  },

  unsubscribeFromTypingEvents: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    const { typingListener, stopTypingListener } = get();
    if (typingListener) socket.off("typing", typingListener);
    if (stopTypingListener) socket.off("stopTyping", stopTypingListener);

    set({ typingListener: null, stopTypingListener: null });
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
