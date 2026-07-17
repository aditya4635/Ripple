import analyticsService from "../services/AnalyticsService.js";

export const logTelemetryEvent = async (req, res) => {
  try {
    const { sessionId, eventType, abVariant, metadata } = req.body;
    const userId = req.user?._id; // Optional authenticated user

    if (!sessionId || !eventType) {
      return res.status(400).json({ message: "sessionId and eventType are required" });
    }

    await analyticsService.logEvent({
      userId,
      sessionId,
      eventType,
      abVariant: abVariant || "none",
      metadata: metadata || {},
    });

    res.status(201).json({ status: "success" });
  } catch (error) {
    console.error("Telemetry error:", error);
    res.status(500).json({ message: "Failed to process telemetry event" });
  }
};

export const getFunnelMetrics = async (req, res) => {
  try {
    const { days } = req.query;
    const metrics = await analyticsService.getGeminiAdoptionFunnel(Number(days) || 7);
    res.status(200).json(metrics);
  } catch (error) {
    console.error("Funnel metrics error:", error);
    res.status(500).json({ message: "Error fetching funnel metrics" });
  }
};

export const getABTestResults = async (req, res) => {
  try {
    const { days } = req.query;
    const results = await analyticsService.getWebRTCABTestMetrics(Number(days) || 14);
    res.status(200).json(results);
  } catch (error) {
    console.error("AB test results error:", error);
    res.status(500).json({ message: "Error fetching A/B test results" });
  }
};
