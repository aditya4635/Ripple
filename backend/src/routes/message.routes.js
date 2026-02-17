import express from "express";
import messageController from "../controllers/MessageController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

router.get("/users", authenticate, messageController.getUsersForSidebar);
router.get("/:id", authenticate, messageController.getMessages);
router.post("/send/:id", authenticate, messageController.sendMessage);
router.put("/read/:id", authenticate, messageController.markAsRead);
router.delete("/:id", authenticate, messageController.deleteMessage);
router.delete(
  "/chat/:userId",
  authenticate,
  messageController.deleteChatHistory
);

export default router;
