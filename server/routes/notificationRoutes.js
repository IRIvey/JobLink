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

// All routes require authentication (both job seekers and companies)
router.use(protect);

// Get user's notifications
router.get("/", getNotifications);

// Get unread count
router.get("/unread-count", getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", markNotificationAsRead);

// Mark all as read
router.patch("/mark-all-read", markAllNotificationsAsRead);

// Delete notification
router.delete("/:notificationId", removeNotification);

export default router;