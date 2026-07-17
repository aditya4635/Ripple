import express from "express";
import {
  logTelemetryEvent,
  getFunnelMetrics,
  getABTestResults,
} from "../controllers/analytics.controller.js";

const router = express.Router();

router.post("/log", logTelemetryEvent);
router.get("/funnel", getFunnelMetrics);
router.get("/ab-test", getABTestResults);

export default router;
