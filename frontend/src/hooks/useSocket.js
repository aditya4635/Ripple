import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import { API_BASE_URL } from "../config/constants.js";

export function useSocket(userId) {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    const socket = io(API_BASE_URL, {
      query: { userId },
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId]);

  const getSocket = useCallback(() => socketRef.current, []);

  return { socket: socketRef.current, getSocket };
}
