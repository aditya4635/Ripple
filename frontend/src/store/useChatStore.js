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
    };

    socket.on("newMessage", messageListener);
    set({ messageListener });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    const messageListener = get().messageListener;
    if (messageListener) {
      socket.off("newMessage", messageListener);
      set({ messageListener: null });
    }
  },

  subscribeToUnreadMessages: () => {
    const socket = useAuthStore.getState().socket;

    // Optimize: Remove existing listener if any
    const existingListener = get().unreadListener;
    if (existingListener) {
      socket.off("newMessage", existingListener);
    }

    const unreadListener = (newMessage) => {
      const { selectedUser, users } = get();
      const isMessageSentFromSelectedUser = selectedUser?._id === newMessage.senderId;

      if (isMessageSentFromSelectedUser) return;

      set({
        users: users.map((user) => {
          if (user._id === newMessage.senderId) {
            return { ...user, unreadCount: (user.unreadCount || 0) + 1 };
          }
          return user;
        }),
      });
    };

    socket.on("newMessage", unreadListener);
    set({ unreadListener });
  },

  unsubscribeFromUnreadMessages: () => {
    const socket = useAuthStore.getState().socket;
    const unreadListener = get().unreadListener;
    if (unreadListener) {
      socket.off("newMessage", unreadListener);
      set({ unreadListener: null });
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
