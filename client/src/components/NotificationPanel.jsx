import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Mail,
  Calendar,
  Briefcase,
  Award,
  Clock,
  MapPin,
  Video,
  Phone,
  User,
} from "lucide-react";

const NotificationPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/notifications?limit=50`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/mark-all-read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    const base = "flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center";
    switch (type) {
      case "application_status":
        return <div className={`${base} bg-blue-100`}><Briefcase size={18} className="text-blue-600" /></div>;
      case "interview_scheduled":
        return <div className={`${base} bg-purple-100`}><Calendar size={18} className="text-purple-600" /></div>;
      case "hiring_decision":
        return <div className={`${base} bg-green-100`}><Award size={18} className="text-green-600" /></div>;
      case "message":
        return <div className={`${base} bg-indigo-100`}><Mail size={18} className="text-indigo-600" /></div>;
      case "new_application":
        return <div className={`${base} bg-yellow-100`}><User size={18} className="text-yellow-600" /></div>;
      default:
        return <div className={`${base} bg-gray-100`}><Bell size={18} className="text-gray-600" /></div>;
    }
  };

  // ✅ Render extra detail card for interview notifications
  const renderInterviewDetails = (notification) => {
    if (notification.type !== "interview_scheduled") return null;
    const d = notification.data;
    if (!d || !d.date) return null;

    const typeIcon =
      d.type === "Video Call" ? <Video size={13} className="text-purple-500" /> :
      d.type === "Phone Call" ? <Phone size={13} className="text-blue-500" /> :
      <MapPin size={13} className="text-green-500" />;

    return (
      <div className="mt-2 bg-purple-50 border border-purple-100 rounded-lg p-3 text-xs space-y-1.5">
        <div className="flex items-center gap-1.5 text-purple-800 font-semibold">
          <Calendar size={13} />
          Interview Details
        </div>
        <div className="flex items-center gap-1.5 text-gray-700">
          <Clock size={13} className="text-gray-500" />
          <span><strong>Date:</strong> {d.date} at {d.time}</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-700">
          {typeIcon}
          <span><strong>Format:</strong> {d.type}</span>
        </div>
        {d.location && (
          <div className="flex items-center gap-1.5 text-gray-700">
            <MapPin size={13} className="text-gray-500" />
            <span>
              <strong>{d.type === "Video Call" ? "Meeting Link:" : "Location:"}</strong>{" "}
              {d.type === "Video Call" ? (
                <a
                  href={d.location}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline break-all"
                >
                  {d.location}
                </a>
              ) : (
                d.location
              )}
            </span>
          </div>
        )}
        {d.notes && (
          <div className="flex items-start gap-1.5 text-gray-700">
            <span className="mt-0.5">📝</span>
            <span><strong>Note:</strong> {d.notes}</span>
          </div>
        )}
      </div>
    );
  };

  // ✅ Render hiring decision detail card
  const renderHiringDecisionDetails = (notification) => {
    if (notification.type !== "hiring_decision") return null;
    const d = notification.data;
    if (!d) return null;

    const isAccepted = d.decision === "accepted";
    return (
      <div className={`mt-2 rounded-lg p-3 text-xs border ${isAccepted ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-100"}`}>
        <div className={`flex items-center gap-1.5 font-semibold ${isAccepted ? "text-green-700" : "text-gray-600"}`}>
          <Award size={13} />
          {isAccepted ? "🎉 You've been hired!" : "Application Reviewed"}
        </div>
        {d.jobTitle && (
          <p className="text-gray-600 mt-1"><strong>Position:</strong> {d.jobTitle}</p>
        )}
        {d.companyName && (
          <p className="text-gray-600"><strong>Company:</strong> {d.companyName}</p>
        )}
      </div>
    );
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-white rounded-t-xl sticky top-0">
            <div>
              <h3 className="text-base font-bold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-500">{unreadCount} unread</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1 disabled:opacity-50"
                >
                  <CheckCheck size={15} />
                  Mark all read
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <Bell size={40} className="text-gray-300 mb-3" />
                <h4 className="text-gray-700 font-semibold mb-1">No notifications</h4>
                <p className="text-gray-400 text-sm text-center">
                  You're all caught up!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    onClick={() => {
                      if (!notification.read) markAsRead(notification._id);
                    }}
                    className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                      !notification.read ? "bg-blue-50 hover:bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <h4 className={`text-sm font-semibold leading-tight ${
                            !notification.read ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed">
                          {notification.message}
                        </p>

                        {/* ✅ Show detailed interview info card */}
                        {renderInterviewDetails(notification)}

                        {/* ✅ Show hiring decision card */}
                        {renderHiringDecisionDetails(notification)}

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {formatTime(notification.createdAt)}
                          </span>
                          <div className="flex items-center gap-1">
                            {!notification.read && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="p-1 rounded hover:bg-gray-200 text-blue-500"
                                title="Mark as read"
                              >
                                <Check size={13} />
                              </button>
                            )}
                            <button
                              onClick={(e) => deleteNotification(notification._id, e)}
                              className="p-1 rounded hover:bg-gray-200 text-red-400"
                              title="Delete"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50 rounded-b-xl text-center">
              <button className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;