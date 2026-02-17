import { create } from "zustand";
import { io } from "socket.io-client";
import { authApi, userApi } from "../api/index.js";
import { API_BASE_URL } from "../config/constants.js";
import toast from "react-hot-toast";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  isVerifying: false,
  onlineUsers: [],
  socket: null,
  authError: null,

  clearAuthError: () => set({ authError: null }),

  checkAuth: async () => {
    try {
      const data = await authApi.checkAuth();
      set({ authUser: data });
      get().connectSocket();
    } catch {
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true, authError: null });
    try {
      const data = await authApi.signup(formData);
      toast.success("OTP sent to your email!");
      return data;
    } catch (error) {
      set({ authError: error.message });
      toast.error(error.message);
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyEmail: async (data) => {
    set({ isVerifying: true, authError: null });
    try {
      const user = await authApi.verifyEmail(data);
      set({ authUser: user });
      get().connectSocket();
      toast.success("Email verified successfully!");
      return user;
    } catch (error) {
      set({ authError: error.message });
      toast.error(error.message);
      throw error;
    } finally {
      set({ isVerifying: false });
    }
  },

  resendOTP: async (data) => {
    try {
      await authApi.resendOTP(data);
      toast.success("New OTP sent!");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true, authError: null });
    try {
      const data = await authApi.login(formData);
      set({ authUser: data });
      get().connectSocket();
      toast.success("Logged in successfully!");
      return data;
    } catch (error) {
      set({ authError: error.message });
      toast.error(error.message);
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  googleLogin: async (token) => {
    try {
      const data = await authApi.googleLogin({ token });
      set({ authUser: data });
      get().connectSocket();
      toast.success("Logged in with Google!");
      return data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
      get().disconnectSocket();
      set({ authUser: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const updatedUser = await userApi.updateProfile(data);
      set({ authUser: updatedUser });
      toast.success("Profile updated successfully");
      return updatedUser;
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  initiateEmailChange: async (data) => {
    try {
      await userApi.initiateEmailChange(data);
      toast.success("Verification OTP sent to your new email");
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  verifyEmailChange: async (data) => {
    try {
      const updatedUser = await userApi.verifyEmailChange(data);
      set({ authUser: updatedUser });
      toast.success("Email changed successfully!");
      return updatedUser;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(API_BASE_URL, {
      query: { userId: authUser._id },
    });

    socket.connect();

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    set({ socket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
    }
    set({ socket: null, onlineUsers: [] });
  },
}));
