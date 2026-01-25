import React, { useMemo, useState, useEffect } from "react";
import {
  FileText,
  Search,
  Star,
  Mail,
  Phone,
  MoreVertical,
  Calendar,
  CheckCircle,
  Download,
  XCircle,
  MapPin,
  Briefcase,
  GraduationCap,
  Award,
  MessageSquare,
} from "lucide-react";

const Applicants = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  
  const [applicationsData, setApplicationsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState(null);

  const statuses = ["All", "New", "Reviewing", "Interview Scheduled", "Rejected", "Hired"];

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [filterStatus]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      const statusParam = filterStatus !== "All" ? `&status=${filterStatus}` : "";

      const res = await fetch(
        `${API_URL}/api/applications/company?page=1&limit=100${statusParam}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to fetch applications");
      }

      if (data.success) {
        setApplicationsData(data.applications || []);
      }
    } catch (err) {
      setError(err.message);
      setApplicationsData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/applications/company/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  };

  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      
      // Map frontend status to backend status
      const statusMap = {
        'New': 'pending',
        'Reviewing': 'reviewing',
        'Interview Scheduled': 'interview',
        'Hired': 'accepted',
        'Rejected': 'rejected'
      };

      const res = await fetch(
        `${API_URL}/api/applications/${applicationId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: statusMap[newStatus] || newStatus.toLowerCase()
          }),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        // Update local state
        setApplicationsData(prev => 
          prev.map(app => 
            app.id === applicationId 
              ? { ...app, status: newStatus }
              : app
          )
        );
        
        if (selectedApplication?.id === applicationId) {
          setSelectedApplication(prev => ({ ...prev, status: newStatus }));
        }
        
        fetchStats();
        alert('Status updated successfully');
      } else {
        throw new Error(data?.message || 'Failed to update status');
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredApplications = useMemo(() => {
    return applicationsData.filter((app) => {
      const matchesFilter = filterStatus === "All" || app.status === filterStatus;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        app.name.toLowerCase().includes(q) || 
        app.job.toLowerCase().includes(q) ||
        app.email.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [applicationsData, filterStatus, searchQuery]);

  const getStatusColor = (status) => {
    const colors = {
      "New": "bg-green-100 text-green-700",
      "Reviewing": "bg-yellow-100 text-yellow-700",
      "Interview Scheduled": "bg-blue-100 text-blue-700",
      "Rejected": "bg-red-100 text-red-700",
      "Hired": "bg-purple-100 text-purple-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Applicants</h1>
          <p className="text-gray-600">Review and manage job applications</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-green-100 p-4">
              <p className="text-sm text-gray-600 mb-1">New</p>
              <p className="text-2xl font-bold text-green-600">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-yellow-100 p-4">
              <p className="text-sm text-gray-600 mb-1">Reviewing</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.reviewing}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-4">
              <p className="text-sm text-gray-600 mb-1">Interview</p>
              <p className="text-2xl font-bold text-blue-600">{stats.interview}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-4">
              <p className="text-sm text-gray-600 mb-1">Hired</p>
              <p className="text-2xl font-bold text-purple-600">{stats.accepted}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, job, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === status
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2 text-gray-600">Loading applications...</p>
          </div>
        )}

        {/* Applications List + Detail */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List */}
            <div className="lg:col-span-1 space-y-3">
              {filteredApplications.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Applications Found</h3>
                  <p className="text-gray-600">Try adjusting your filters</p>
                </div>
              ) : (
                filteredApplications.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApplication(app)}
                    className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all hover:shadow-md ${
                      selectedApplication?.id === app.id
                        ? "border-indigo-500 ring-2 ring-indigo-200"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {app.profilePhoto ? (
                          <img 
                            src={app.profilePhoto} 
                            alt={app.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                            {app.name[0]}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{app.name}</h3>
                          <p className="text-sm text-gray-500">{app.experience}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star size={14} fill="currentColor" />
                        <span className="text-sm font-medium">{app.rating}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">{app.job}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {app.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                      {app.skills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{app.skills.length - 3} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(app.status)}`}>
                        {app.status}
                      </span>
                      <span className="text-xs text-gray-500">{app.appliedDate}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Detail */}
            <div className="lg:col-span-2">
              {selectedApplication ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      {selectedApplication.profilePhoto ? (
                        <img 
                          src={selectedApplication.profilePhoto} 
                          alt={selectedApplication.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
                          {selectedApplication.name[0]}
                        </div>
                      )}
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{selectedApplication.name}</h2>
                        <p className="text-gray-600">{selectedApplication.job}</p>

                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star size={16} fill="currentColor" />
                            <span className="text-sm font-medium">{selectedApplication.rating}</span>
                          </div>
                          <span className="text-gray-400">•</span>
                          <span className="text-sm text-gray-600">{selectedApplication.experience}</span>
                          {selectedApplication.location && (
                            <>
                              <span className="text-gray-400">•</span>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-gray-500" />
                                <span className="text-sm text-gray-600">{selectedApplication.location}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                  </div>

                  {/* Contact */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Mail size={18} className="text-gray-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-medium text-gray-900 truncate">{selectedApplication.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone size={18} className="text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedApplication.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {selectedApplication.coverLetter && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare size={18} />
                        Cover Letter
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedApplication.coverLetter}</p>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  {selectedApplication.skills && selectedApplication.skills.length > 0 && (
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Award size={18} />
                        Skills
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedApplication.skills.map((skill, idx) => (
                          <span key={idx} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mb-6">
                    <button 
                      onClick={() => handleStatusUpdate(selectedApplication.id, "Interview Scheduled")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <Calendar size={18} />
                      Schedule Interview
                    </button>

                    <button 
                      onClick={() => handleStatusUpdate(selectedApplication.id, "Hired")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      Hire Candidate
                    </button>

                    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download size={18} />
                    </button>

                    <button 
                      onClick={() => handleStatusUpdate(selectedApplication.id, "Rejected")}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  {/* Status */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Update Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {["New", "Reviewing", "Interview Scheduled", "Rejected", "Hired"].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusUpdate(selectedApplication.id, status)}
                          className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                            selectedApplication.status === status
                              ? "bg-indigo-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status History */}
                  {selectedApplication.statusHistory && selectedApplication.statusHistory.length > 0 && (
                    <div className="border-t pt-4 mt-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Status History</h3>
                      <div className="space-y-2">
                        {selectedApplication.statusHistory.map((history, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(history.status)}`}>
                              {history.status}
                            </span>
                            <span className="text-gray-500">
                              {new Date(history.updatedAt).toLocaleDateString()}
                            </span>
                            {history.notes && <span className="text-gray-600">- {history.notes}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Application Selected</h3>
                  <p className="text-gray-600">Select an application from the list to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Applicants;
