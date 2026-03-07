import React, { useState, useEffect, useCallback } from "react";
import { 
  Briefcase, 
  Users, 
   Eye,
  MapPin, 
  TrendingUp,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// Defined outside component to avoid re-creating on every render
const StatCard = ({ icon: Icon, label, value, trend, trendValue, trendUp }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 rounded-lg bg-indigo-50">
          <Icon size={24} className="text-indigo-600" />
        </div>
        {trend && trendValue && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
            trendUp ? "bg-indigo-50 text-indigo-700" : "bg-gray-100 text-gray-600"
          }`}>
            {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{label}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {trend && <p className="text-xs text-gray-500 mt-2">{trend}</p>}
    </div>
  );
};

const DashboardHome = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewScheduled: 0,
    rejected: 0,
  });
  
  const [recentApplications, setRecentApplications] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, appsRes, jobsRes] = await Promise.all([
        fetch(`${API_URL}/api/companies/dashboard/stats`, { headers }),
        fetch(`${API_URL}/api/companies/dashboard/applications?page=1&limit=5`, { headers }),
        fetch(`${API_URL}/api/companies/dashboard/jobs?status=active&limit=5`, { headers }),
      ]);

      const [statsData, appsData, jobsData] = await Promise.all([
        statsRes.json(),
        appsRes.json(),
        jobsRes.json(),
      ]);

      if (statsRes.ok && statsData.success) setStats(statsData.stats);
      if (appsRes.ok  && appsData.success)  setRecentApplications(appsData.applications || []);
      if (jobsRes.ok  && jobsData.success)  setTopJobs(jobsData.jobs || []);

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getStatusColor = (status) => {
    const colors = {
      "New":                 "bg-indigo-50 text-indigo-700 border-indigo-200",
      "Reviewing":           "bg-indigo-50 text-indigo-600 border-indigo-200",
      "Interview Scheduled": "bg-indigo-100 text-indigo-700 border-indigo-300",
      "Rejected":            "bg-gray-100 text-gray-600 border-gray-200",
      "Hired":               "bg-indigo-600 text-white border-indigo-600",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl shadow-sm p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back!</h1>
        <p className="text-indigo-100">Here's what's happening with your recruitment today</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          icon={Briefcase} 
          label="Active Job Postings" 
          value={stats.activeJobs} 
          trend="Total active positions"
          trendValue="+12%"
          trendUp={true}
        />
        <StatCard 
          icon={Users} 
          label="New Applications" 
          value={stats.newApplications} 
          trend="Pending review"
          trendValue="+8%"
          trendUp={true}
        />
        <StatCard 
          icon={Calendar} 
          label="Interviews Scheduled" 
          value={stats.interviewScheduled} 
          trend="This week"
          trendValue="+15%"
          trendUp={true}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard 
          icon={TrendingUp} 
          label="Total Applications" 
          value={stats.totalApplications} 
          trend="All time"
        />
        <StatCard 
          icon={XCircle} 
          label="Rejected" 
          value={stats.rejected} 
          trend="This month"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
              <p className="text-sm text-gray-500">Latest candidate submissions</p>
            </div>
          </div>

          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div key={app._id || app.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-200">
                  <div className="flex items-center gap-3">
                    {app.profilePhoto ? (
                      <img 
                        src={app.profilePhoto} 
                        alt={app.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {app.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{app.name}</p>
                      <p className="text-sm text-gray-500">{app.job}</p>
                      <p className="text-xs text-gray-400">{app.appliedDate}</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No recent applications</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recent Jobs</h2>
              <p className="text-sm text-gray-500">Most active job postings</p>
            </div>
          </div>

          <div className="space-y-3">
            {topJobs.length > 0 ? (
              topJobs.map((job, idx) => (
                <div key={job._id || job.id} className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-200">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                          {idx + 1}
                        </span>
                        <p className="font-semibold text-gray-900">{job.title}</p>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin size={14} /> {job.location}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200">
                      {job.applicants} apps
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-gray-600">
                      <Eye size={14} className="text-gray-400" /> 
                      <span className="font-medium">{job.views}</span> views
                    </span>
                    {/* Only show conversion rate when both values are available */}
                    {job.views > 0 && job.applicants > 0 && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="flex items-center gap-1 text-gray-600">
                          <TrendingUp size={14} className="text-indigo-600" /> 
                          <span className="font-medium text-indigo-600">
                            {Math.round((job.applicants / job.views) * 100)}%
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Briefcase size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No active job postings</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;