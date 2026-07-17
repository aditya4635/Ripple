import AnalyticsEvent from "../models/analytics.model.js";
import logger from "../utils/logger.js";

class AnalyticsService {
  /**
   * Log a telemetry event from client or server
   */
  async logEvent({ userId, sessionId, eventType, abVariant = "none", metadata = {} }) {
    try {
      const event = await AnalyticsEvent.create({
        userId: userId || null,
        sessionId,
        eventType,
        abVariant,
        metadata,
      });
      return event;
    } catch (error) {
      logger.error("Failed to log analytics event", error);
      // Non-blocking telemetry failure
      return null;
    }
  }

  /**
   * Get funnel metrics for Gemini API adoption and retention
   */
  async getGeminiAdoptionFunnel(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: "$sessionId",
          hasStart: {
            $max: { $cond: [{ $eq: ["$eventType", "session_start"] }, 1, 0] },
          },
          hasGeminiPrompt: {
            $max: { $cond: [{ $eq: ["$eventType", "gemini_prompt_triggered"] }, 1, 0] },
          },
          hasGeminiResponse: {
            $max: { $cond: [{ $eq: ["$eventType", "gemini_response_received"] }, 1, 0] },
          },
          maxDurationSec: { $max: "$metadata.sessionDurationSec" },
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          sessionsWithPrompt: { $sum: "$hasGeminiPrompt" },
          sessionsWithResponse: { $sum: "$hasGeminiResponse" },
          avgDurationWithGemini: {
            $avg: {
              $cond: [{ $eq: ["$hasGeminiPrompt", 1] }, "$maxDurationSec", null],
            },
          },
          avgDurationWithoutGemini: {
            $avg: {
              $cond: [{ $eq: ["$hasGeminiPrompt", 0] }, "$maxDurationSec", null],
            },
          },
        },
      },
    ];

    const results = await AnalyticsEvent.aggregate(pipeline);
    return results[0] || { totalSessions: 0, sessionsWithPrompt: 0 };
  }

  /**
   * Get WebRTC P2P connection A/B test results
   */
  async getWebRTCABTestMetrics(days = 14) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const pipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
          abVariant: { $in: ["control_v1", "webrtc_ui_v2"] },
          eventType: { $in: ["p2p_connection_attempt", "p2p_connection_success", "p2p_connection_failed"] },
        },
      },
      {
        $group: {
          _id: "$abVariant",
          totalAttempts: {
            $sum: { $cond: [{ $eq: ["$eventType", "p2p_connection_attempt"] }, 1, 0] },
          },
          successfulConnections: {
            $sum: { $cond: [{ $eq: ["$eventType", "p2p_connection_success"] }, 1, 0] },
          },
          failedConnections: {
            $sum: { $cond: [{ $eq: ["$eventType", "p2p_connection_failed"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          abVariant: "$_id",
          totalAttempts: 1,
          successfulConnections: 1,
          failedConnections: 1,
          successRate: {
            $cond: [
              { $gt: ["$totalAttempts", 0] },
              { $multiply: [{ $divide: ["$successfulConnections", "$totalAttempts"] }, 100] },
              0,
            ],
          },
        },
      },
    ];

    return await AnalyticsEvent.aggregate(pipeline);
  }
}

export default new AnalyticsService();
