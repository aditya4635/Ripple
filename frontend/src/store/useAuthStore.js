import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isVerifying: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  authError: null, // Added error state
  errorTimeoutId: null, // To track timeout

  setAuthError: (message) => {
    const { errorTimeoutId } = get();
    if (errorTimeoutId) clearTimeout(errorTimeoutId);

    const newTimeoutId = setTimeout(() => {
      set({ authError: null });
    }, 5000); // Auto-dismiss after 5 seconds

    set({ authError: message, errorTimeoutId: newTimeoutId });
  },

  clearAuthError: () => {
    const { errorTimeoutId } = get();
    if (errorTimeoutId) clearTimeout(errorTimeoutId);
    set({ authError: null, errorTimeoutId: null });
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true, authError: null });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      toast.success(res.data.message || "OTP sent to your email");
      return { success: true, email: res.data.email };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Signup failed";
      toast.error(errorMessage);
      get().setAuthError(errorMessage);
      return { success: false };
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyEmail: async (data) => {
    set({ isVerifying: true, authError: null });
    try {
      const res = await axiosInstance.post("/auth/verify-email", data);
      set({ authUser: res.data });
      toast.success("Email verified successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Verification failed";
      toast.error(errorMessage);
      get().setAuthError(errorMessage);
      return false;
    } finally {
      set({ isVerifying: false });
    }
  },

  googleLogin: async (token) => {
    set({ isLoggingIn: true, authError: null });
    try {
      const res = await axiosInstance.post("/auth/google", { token });
      set({ authUser: res.data });
      toast.success("Logged in with Google");
      get().connectSocket();
      return true;
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Google login failed";
      toast.error(errorMessage);
      get().setAuthError(errorMessage);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true, authError: null });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      
      // Check if user needs to verify email
      if (res.data.isVerified === false) {
        toast.info(res.data.message);
        return { success: false, needsVerification: true, email: res.data.email };
      }
      
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return { success: true };
    } catch (error) {
      console.log("Login error:", error);
      const errorMessage = error.response?.data?.message || error.message || "Login failed";
      
      // Check if the error response includes verification info
      if (error.response?.data?.isVerified === false) {
        return { success: false, needsVerification: true, email: error.response.data.email };
      }
      
      toast.error(errorMessage);
      get().setAuthError(errorMessage);
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, {
      query: {
        userId: authUser._id,
      },
    });
    socket.connect();

    set({ socket: socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
      console.log(userIds)
    });
  },
  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
