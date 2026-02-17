import Navbar from "./components/layout/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import OTPPage from "./pages/OTPPage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { useEffect } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/shared/PageTransition";
import { GoogleOAuthProvider } from "@react-oauth/google";

import { useVideoCallStore } from "./stores/videoCallStore";
import VideoCall from "./components/chat/VideoCall";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, socket } = useAuthStore();
  const { theme } = useThemeStore();
  const { isCalling, isIncomingCall, setIncomingCall, setCallerInfo } = useVideoCallStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [checkAuth, theme]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on("callUser", ({ from, signal, name }) => {
      setIncomingCall(true);
      setCallerInfo(name, from, signal);
    });
    
    return () => {
      socket.off("callUser");
    };
  }, [socket, setIncomingCall, setCallerInfo]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
      <div className="font-sans text-base-content bg-base-100 transition-colors duration-300">
        <Navbar />
        
        {(isCalling || isIncomingCall) && <VideoCall />}

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={authUser ? <PageTransition><HomePage /></PageTransition> : <Navigate to="/login" />} />
            <Route path="/signup" element={!authUser ? <PageTransition><SignUpPage /></PageTransition> : <Navigate to="/" />} />
            <Route path="/login" element={!authUser ? <PageTransition><LoginPage /></PageTransition> : <Navigate to="/" />} />
            <Route path="/otp" element={!authUser ? <PageTransition><OTPPage /></PageTransition> : <Navigate to="/" />} />
            <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
            <Route path="/profile" element={authUser ? <PageTransition><ProfilePage /></PageTransition> : <Navigate to="/login" />} />
          </Routes>
        </AnimatePresence>

        <Toaster />
      </div>
    </GoogleOAuthProvider>
  );
};
export default App;
