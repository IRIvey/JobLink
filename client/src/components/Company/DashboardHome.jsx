import React, { useState, useEffect } from "react";
import { 
  Briefcase, 
  Users, 
  Eye, 
  CheckCircle, 
  MapPin, 
  TrendingUp,
  Clock,
  UserCheck,
  XCircle,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3
} from "lucide-react";

const DashboardHome = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";
  
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    newApplications: 0,
    interviewScheduled: 0,
    hired: 0,
    rejected: 0,
    totalViews: 0,
    avgTimeToHire: 0
  });
  
  const [recentApplications, setRecentApplications] = useState([]);
  const [topJobs, setTopJobs] = useState([]);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch dashboard stats
      const statsRes = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const statsData = await statsRes.json();

      if (statsRes.ok && statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch recent applications
      const appsRes = await fetch(`${API_URL}/api/applications/company?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const appsData = await appsRes.json();

      if (appsRes.ok && appsData.success) {
        setRecentApplications(appsData.applications || []);
      }

      // Fetch top performing jobs
      const jobsRes = await fetch(`${API_URL}/api/jobs/company?status=active&limit=5`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = await jobsRes.json();

      if (jobsRes.ok && jobsData.success) {
        setTopJobs(jobsData.jobs || []);
      }

      // Fetch weekly stats for chart
      const weeklyRes = await fetch(`${API_URL}/api/dashboard/weekly-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const weeklyData = await weeklyRes.json();

      if (weeklyRes.ok && weeklyData.success) {
        setWeeklyStats(weeklyData.stats || []);
      }

    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "New": "bg-indigo-50 text-indigo-700 border-indigo-200",
      "Reviewing": "bg-indigo-50 text-indigo-600 border-indigo-200",
      "Interview Scheduled": "bg-indigo-100 text-indigo-700 border-indigo-300",
      "Rejected": "bg-gray-100 text-gray-600 border-gray-200",
      "Hired": "bg-indigo-600 text-white border-indigo-600",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const StatCard = ({ icon: Icon, label, value, trend, trendValue, trendUp }) => {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 rounded-lg bg-indigo-50">
            <Icon size={24} className="text-indigo-600" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg ${
              trendUp ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-600'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <StatCard 
          icon={UserCheck} 
          label="Candidates Hired" 
          value={stats.hired} 
          trend="This month"
          trendValue="+5%"
          trendUp={true}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={Eye} 
          label="Total Job Views" 
          value={stats.totalViews} 
          trend="Across all postings"
        />
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
        <StatCard 
          icon={Clock} 
          label="Avg. Time to Hire" 
          value={`${stats.avgTimeToHire} days`} 
          trend="Industry avg: 42 days"
        />
      </div>

      {/* Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Application Trends</h2>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
              <BarChart3 size={16} />
              View Report
            </button>
          </div>

          {/* Simple Bar Chart */}
          <div className="space-y-4">
            {weeklyStats.length > 0 ? (
              weeklyStats.map((day, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-600 w-12">{day.day}</span>
                  <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                    <div 
                      className="bg-indigo-600 h-full rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${(day.applications / Math.max(...weeklyStats.map(d => d.applications))) * 100}%` }}
                    >
                      <span className="text-xs font-semibold text-white">{day.applications}</span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500 w-16 text-right">{day.views} views</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No data available for the past week</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Conversion Rate</p>
                  <p className="text-lg font-bold text-gray-900">24.5%</p>
                </div>
              </div>
              <ArrowUpRight className="text-indigo-600" size={20} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <Users className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Active Candidates</p>
                  <p className="text-lg font-bold text-gray-900">{stats.totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Offer Acceptance</p>
                  <p className="text-lg font-bold text-gray-900">89%</p>
                </div>
              </div>
              <ArrowUpRight className="text-indigo-600" size={20} />
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-indigo-600" size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-600">Cost per Hire</p>
                  <p className="text-lg font-bold text-gray-900">$2,450</p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All →</button>
          </div>

          <div className="space-y-3">
            {recentApplications.length > 0 ? (
              recentApplications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-200">
                  <div className="flex items-center gap-3">
                    {app.profilePhoto ? (
                      <img 
                        src={app.profilePhoto} 
                        alt={app.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                        {app.name[0]}
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

        {/* Top Performing Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Top Performing Jobs</h2>
              <p className="text-sm text-gray-500">Most active job postings</p>
            </div>
            <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All →</button>
          </div>

          <div className="space-y-3">
            {topJobs.length > 0 ? (
              topJobs.map((job, idx) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 rounded-lg cursor-pointer transition-all border border-transparent hover:border-gray-200">
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
                    <span className="text-gray-300">•</span>
                    <span className="flex items-center gap-1 text-gray-600">
                      <TrendingUp size={14} className="text-indigo-600" /> 
                      <span className="font-medium text-indigo-600">+{Math.floor(Math.random() * 20 + 5)}%</span>
                    </span>
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