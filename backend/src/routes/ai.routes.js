import express from "express";
import aiController from "../controllers/AIController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.post("/chat", authenticate, aiController.chat);

export default router;
