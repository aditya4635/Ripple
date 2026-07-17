import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export const useTelemetryAndAB = () => {
  const [abVariant, setAbVariant] = useState("control_v1");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    // 1. Initialize or retrieve persistent A/B test variant assignment (50/50 split)
    let storedVariant = localStorage.getItem("ripple_ab_variant");
    if (!storedVariant) {
      storedVariant = Math.random() < 0.5 ? "control_v1" : "webrtc_ui_v2";
      localStorage.setItem("ripple_ab_variant", storedVariant);
    }
    setAbVariant(storedVariant);

    // 2. Initialize active session identifier
    let currentSessionId = sessionStorage.getItem("ripple_session_id");
    if (!currentSessionId) {
      currentSessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("ripple_session_id", currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []);

  /**
   * Send telemetry event to backend analytics ingestion endpoint
   */
  const logEvent = useCallback(
    async (eventType, metadata = {}) => {
      if (!sessionId) return;
      try {
        await axios.post(`${API_BASE_URL}/analytics/log`, {
          sessionId,
          eventType,
          abVariant,
          metadata,
        });
      } catch (err) {
        // Silent failure so tracking errors never impact the critical user flow
        console.debug("Telemetry log non-blocking error:", err?.message);
      }
    },
    [sessionId, abVariant]
  );

  return {
    abVariant,
    sessionId,
    logEvent,
  };
};

export default useTelemetryAndAB;
