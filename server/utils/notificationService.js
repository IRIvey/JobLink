import Notification from "../models/Notification.js";

// Create notification
export const createNotification = async ({
  recipient,
  recipientModel,
  sender = null,
  senderModel = "System",
  type,
  title,
  message,
  link = null,
  data = {},
}) => {
  try {
    const notification = new Notification({
      recipient,
      recipientModel,
      sender,
      senderModel,
      type,
      title,
      message,
      link,
      data,
    });

    await notification.save();
    return { success: true, notification };
  } catch (error) {
    console.error("Create notification error:", error);
    return { success: false, error: error.message };
  }
};

// Get user notifications
export const getUserNotifications = async (userId, userModel, limit = 50) => {
  try {
    const notifications = await Notification.find({
      recipient: userId,
      recipientModel: userModel,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    const unreadCount = await Notification.countDocuments({
      recipient: userId,
      recipientModel: userModel,
      read: false,
    });

    return {
      success: true,
      notifications,
      unreadCount,
    };
  } catch (error) {
    console.error("Get notifications error:", error);
    return { success: false, error: error.message };
  }
};

// Mark notification as read
export const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true },
      { new: true }
    );

    return { success: true, notification };
  } catch (error) {
    console.error("Mark as read error:", error);
    return { success: false, error: error.message };
  }
};

// Mark all as read
export const markAllAsRead = async (userId, userModel) => {
  try {
    await Notification.updateMany(
      { recipient: userId, recipientModel: userModel, read: false },
      { read: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Mark all as read error:", error);
    return { success: false, error: error.message };
  }
};

// Delete notification
export const deleteNotification = async (notificationId, userId) => {
  try {
    await Notification.findOneAndDelete({
      _id: notificationId,
      recipient: userId,
    });

    return { success: true };
  } catch (error) {
    console.error("Delete notification error:", error);
    return { success: false, error: error.message };
  }
};

// Notification templates
export const notificationTemplates = {
  newApplication: ({ jobTitle, candidateName }) => ({
    type: "new_application",
    title: "New Application Received",
    message: `${candidateName} has applied for ${jobTitle}`,
  }),

  applicationStatusUpdate: ({ jobTitle, status }) => ({
    type: "application_status",
    title: "Application Status Updated",
    message: `Your application for ${jobTitle} is now ${status}`,
  }),

  interviewScheduled: ({ jobTitle, date, time }) => ({
    type: "interview_scheduled",
    title: "Interview Scheduled",
    message: `Your interview for ${jobTitle} is scheduled on ${date} at ${time}`,
  }),

  hiringDecision: ({ jobTitle, decision }) => ({
    type: "hiring_decision",
    title: decision === "accepted" ? "Congratulations!" : "Application Update",
    message:
      decision === "accepted"
        ? `You have been selected for ${jobTitle}!`
        : `Your application for ${jobTitle} has been reviewed`,
  }),
};

export default {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notificationTemplates,
};