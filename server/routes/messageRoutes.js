import express from "express";
import {
  sendMessage,
  getInbox,
  getSentMessages,
  markAsRead,
  getUnreadCount,
  deleteMessage
} from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Send message
router.post("/send", sendMessage);

// Get inbox
router.get("/inbox", getInbox);

// Get sent messages
router.get("/sent", getSentMessages);

// Mark as read
router.patch("/:messageId/read", markAsRead);

// Get unread count
router.get("/unread/count", getUnreadCount);

// Delete message
router.delete("/:messageId", deleteMessage);

export default router;