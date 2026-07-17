import mongoose from "mongoose";

const analyticsEventSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Allow anonymous / pre-login tracking for funnel top
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "session_start",
        "session_heartbeat",
        "session_end",
        "gemini_prompt_triggered",
        "gemini_response_received",
        "p2p_connection_attempt",
        "p2p_connection_success",
        "p2p_connection_failed",
        "ui_button_click",
      ],
      index: true,
    },
    abVariant: {
      type: String,
      enum: ["control_v1", "webrtc_ui_v2", "none"],
      default: "none",
      index: true,
    },
    metadata: {
      feature: { type: String, default: "" },
      connectionState: { type: String, default: "" },
      latencyMs: { type: Number, default: 0 },
      sessionDurationSec: { type: Number, default: 0 },
      errorReason: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for rapid funnel aggregation and A/B cohort filtering
analyticsEventSchema.index({ eventType: 1, createdAt: -1 });
analyticsEventSchema.index({ abVariant: 1, eventType: 1 });
analyticsEventSchema.index({ sessionId: 1, createdAt: 1 });

const AnalyticsEvent = mongoose.model("AnalyticsEvent", analyticsEventSchema);

export default AnalyticsEvent;
