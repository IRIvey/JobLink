import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../utils/notificationService.js";

// ✅ Detect whether the logged-in user is a Company or JobSeeker
// This works with common JWT payloads that include role or userType
const getUserModel = (req) => {
  const role = req.user?.role || req.user?.userType || req.user?.type || "";
  
  if (role === "company" || role === "Company" || role === "employer") {
    return "Company";
  }
  return "JobSeeker";
};

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userModel = getUserModel(req);
    const limit = parseInt(req.query.limit) || 50;

    const result = await getUserNotifications(userId, userModel, limit);

    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to retrieve notifications" });
    }

    res.status(200).json({
      success: true,
      notifications: result.notifications,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve notifications", error: error.message });
  }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userModel = getUserModel(req);

    const result = await getUserNotifications(userId, userModel, 1);

    res.status(200).json({
      success: true,
      unreadCount: result.unreadCount || 0,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve unread count", error: error.message });
  }
};

// PATCH /api/notifications/:notificationId/read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id || req.user._id;

    const result = await markAsRead(notificationId, userId);

    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to mark as read" });
    }

    res.status(200).json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark notification as read", error: error.message });
  }
};

// PATCH /api/notifications/mark-all-read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const userModel = getUserModel(req);

    const result = await markAllAsRead(userId, userModel);

    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to mark all as read" });
    }

    res.status(200).json({ success: true, message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({ success: false, message: "Failed to mark all as read", error: error.message });
  }
};

// DELETE /api/notifications/:notificationId
export const removeNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id || req.user._id;

    const result = await deleteNotification(notificationId, userId);

    if (!result.success) {
      return res.status(500).json({ success: false, message: "Failed to delete notification" });
    }

    res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "Failed to delete notification", error: error.message });
  }
};