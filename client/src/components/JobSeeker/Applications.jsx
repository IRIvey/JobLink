import React, { useState, useEffect } from "react";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  Building2,
  MapPin,
  AlertCircle,
  X,
  Mail,
  Users,
  Briefcase,
} from "lucide-react";

/* ================= MESSAGE MODAL (ISOLATED STATE – FIXED TYPING) ================= */
const MessageModal = ({
  application,
  onClose,
  onSend,
  sendingMessage,
  messageSuccess,
}) => {
  const [localMessageData, setLocalMessageData] = useState({
    subject: "",
    message: "",
  });

  useEffect(() => {
    if (application) {
      const jobTitle =
        typeof application.job === "object"
          ? application.job.title
          : application.jobTitle || "Position";

      setLocalMessageData({
        subject: `Regarding Application for ${jobTitle}`,
        message: "",
      });
    }
  }, [application]);

  if (!application) return null;

  const companyObj =
    typeof application.company === "object" ? application.company : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full">
        <div className="border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            Message Recruiter
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Sending message to:</p>
            <p className="font-semibold text-gray-900">
              {companyObj?.companyName || "Company"}
            </p>
            <p className="text-sm text-gray-600">
              Regarding: {application.job?.title || "Your Application"}
            </p>
          </div>

          {messageSuccess ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <p className="text-green-800 font-medium">
                Message sent successfully!
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={localMessageData.subject}
                  onChange={(e) =>
                    setLocalMessageData((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  rows={6}
                  value={localMessageData.message}
                  onChange={(e) =>
                    setLocalMessageData((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </>
          )}
        </div>

        <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>

          {!messageSuccess && (
            <button
              onClick={() => onSend(localMessageData)}
              disabled={sendingMessage}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {sendingMessage ? "Sending..." : "Send Message"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ================= MAIN COMPONENT (UI UNCHANGED) ================= */
const Applications = () => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSuccess, setMessageSuccess] = useState(false);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API_URL}/api/jobs/applications?status=${filter}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || `Failed (${res.status})`);
        setApplications([]);
        return;
      }

      if (data.success) setApplications(data.applications || []);
      else {
        setError(data?.message || "Failed to load applications");
        setApplications([]);
      }
    } catch {
      setError("Cannot connect to server.");
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (msgData) => {
    if (!msgData.message.trim()) {
      alert("Please enter a message");
      return;
    }

    setSendingMessage(true);
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyId: selectedApplication?.company?._id ?? selectedApplication?.company,
          subject: msgData.subject,
          message: msgData.message,
          applicationId: selectedApplication?._id,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setMessageSuccess(true);
        setTimeout(() => {
          setShowMessageModal(false);
          setMessageSuccess(false);
        }, 2000);
      } else {
        alert(data?.message || `Request failed (${response.status})`);
      }
    } catch {
      alert("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  /* ================= STATUS BADGE (UNCHANGED) ================= */
  const getStatusBadge = (status = "pending") => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      reviewing: "bg-blue-100 text-blue-800",
      interview: "bg-purple-100 text-purple-800",
      accepted: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };

    const icons = {
      pending: Clock,
      reviewing: Eye,
      interview: Calendar,
      accepted: CheckCircle,
      rejected: XCircle,
    };

    const Icon = icons[status] || Clock;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          styles[status] || styles.pending
        }`}
      >
        <Icon size={16} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  /* ================= APPLICATION CARD (UNCHANGED) ================= */
  const ApplicationCard = ({ application }) => {
    const jobObj = typeof application.job === "object" ? application.job : null;
    const companyObj =
      typeof application.company === "object" ? application.company : null;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building2 className="text-indigo-600" size={32} />
            </div>

            <div>
              <h3 className="text-lg font-semibold">
                {jobObj?.title || "Untitled Job"}
              </h3>
              <p className="text-gray-600">
                {companyObj?.companyName || "Company"}
              </p>
            </div>
          </div>

          {getStatusBadge(application.status)}
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              setSelectedApplication(application);
              setShowMessageModal(true);
            }}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Message Recruiter
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
        <p className="text-gray-600">Track and manage all your job applications</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-center py-12">Loading...</p>
      ) : (
        applications.map((app) => (
          <ApplicationCard key={app._id} application={app} />
        ))
      )}

      {showMessageModal && (
        <MessageModal
          application={selectedApplication}
          onClose={() => setShowMessageModal(false)}
          onSend={sendMessage}
          sendingMessage={sendingMessage}
          messageSuccess={messageSuccess}
        />
      )}
    </div>
  );
};

export default Applications;
