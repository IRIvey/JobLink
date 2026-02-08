import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../utils/notificationService.js";

// Get user's notifications
export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const userModel = req.user.role === "company" ? "Company" : "JobSeeker";
    const { limit = 50 } = req.query;

    const result = await getUserNotifications(userId, userModel, parseInt(limit));

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve notifications",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      notifications: result.notifications,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notifications",
      error: error.message,
    });
  }
};

// Get unread count
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const userModel = req.user.role === "company" ? "Company" : "JobSeeker";

    const result = await getUserNotifications(userId, userModel, 1);

    res.status(200).json({
      success: true,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve unread count",
      error: error.message,
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await markAsRead(notificationId, userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to mark notification as read",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      notification: result.notification,
    });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const userModel = req.user.role === "company" ? "Company" : "JobSeeker";

    const result = await markAllAsRead(userId, userModel);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to mark all notifications as read",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications as read error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};

// Delete notification
export const removeNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const result = await deleteNotification(notificationId, userId);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete notification",
        error: result.error,
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};

export default {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
};