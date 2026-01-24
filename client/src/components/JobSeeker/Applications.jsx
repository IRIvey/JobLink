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
} from "lucide-react";

const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

 const fetchApplications = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setError("Login session expired. Please log in again.");
        setLoading(false);
        return;
      }

      // Ensure the URL matches your server's base URL and port
      const response = await fetch(
        `http://localhost:5001/api/jobs/applications?status=${filter}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Server Error: ${response.status}`);
      }

      if (data.success) {
        // We look specifically for data.applications as defined in our controller
        setApplications(Array.isArray(data.applications) ? data.applications : []);
      } else {
        setError(data.message || "Failed to retrieve data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message === "Failed to fetch" 
        ? "Cannot connect to server. Is the backend running on port 5001?" 
        : err.message
      );
    } finally {
      setLoading(false);
    }
  };

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

  const ApplicationCard = ({ application }) => {
    /**
     * IMPORTANT:
     * If backend populates, job/company are objects.
     * If backend does NOT populate, job/company are ObjectId strings.
     */
    const jobObj = typeof application.job === "object" ? application.job : null;
    const companyObj =
      typeof application.company === "object" ? application.company : null;

    const jobTitle = jobObj?.title || application.jobTitle || "Untitled Job";
    const companyName =
      companyObj?.companyName ||
      companyObj?.name ||
      application.companyName ||
      "Company";
    const location = jobObj?.location || application.location || "Location";

    const appliedDate = application.appliedDate
      ? new Date(application.appliedDate).toLocaleDateString()
      : "-";

    const updatedAt = application.updatedAt
      ? new Date(application.updatedAt).toLocaleDateString()
      : "-";

    const logo = companyObj?.logo || "";

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex gap-4 flex-1">
            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {logo ? (
                <img
                  src={logo}
                  alt={companyName}
                  className="w-12 h-12 object-contain"
                />
              ) : (
                <Building2 className="text-indigo-600" size={32} />
              )}
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {jobTitle}
              </h3>
              <p className="text-gray-600 mb-2">{companyName}</p>

              <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  {location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  Applied {appliedDate}
                </div>
              </div>
            </div>
          </div>

          {getStatusBadge(application.status || "pending")}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">Last updated: {updatedAt}</div>

          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              View Details
            </button>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              Message Recruiter
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Stats should be based on ALL applications you have loaded.
  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === "pending").length,
    reviewing: applications.filter((a) => a.status === "reviewing").length,
    interview: applications.filter((a) => a.status === "interview").length,
    accepted: applications.filter((a) => a.status === "accepted").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h1>
        <p className="text-gray-600">Track and manage all your job applications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-yellow-200 p-4">
          <p className="text-sm text-yellow-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-blue-200 p-4">
          <p className="text-sm text-blue-600 mb-1">Reviewing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.reviewing}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-purple-200 p-4">
          <p className="text-sm text-purple-600 mb-1">Interview</p>
          <p className="text-2xl font-bold text-purple-600">{stats.interview}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-4">
          <p className="text-sm text-green-600 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-red-200 p-4">
          <p className="text-sm text-red-600 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {["all", "pending", "reviewing", "interview", "accepted", "rejected"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filter === status
                    ? "bg-indigo-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600" size={20} />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No applications yet
            </h3>
            <p className="text-gray-600 mb-4">
              Start applying to jobs to see them here
            </p>
            <button
              onClick={() => (window.location.href = "/jobs")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          applications.map((application) => (
            <ApplicationCard key={application._id} application={application} />
          ))
        )}
      </div>
    </div>
  );
};

export default Applications;
