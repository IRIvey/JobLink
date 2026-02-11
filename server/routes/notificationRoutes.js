import express from "express";
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

// ✅ IMPORTANT: mark-all-read must come BEFORE /:notificationId routes
// Otherwise Express will treat "mark-all-read" as a notificationId param

router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/mark-all-read", markAllNotificationsAsRead);   // ← must be before /:id
router.patch("/:notificationId/read", markNotificationAsRead);
router.delete("/:notificationId", removeNotification);

export default router;