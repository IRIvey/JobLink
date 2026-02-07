import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrendingUp,
  Users,
  Briefcase,
  CheckCircle,
  Clock,
  Target,
  Activity,
  BarChart3,
} from "lucide-react";

const API_URL = "http://localhost:5001/api";

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [analytics, setAnalytics] = useState({
    overview: {
      totalApplications: 0,
      activeJobs: 0,
      totalHires: 0,
      pendingReview: 0,
    },
    statusBreakdown: {
      pending: 0,
      reviewing: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    },
    conversionRates: {
      applicationToInterview: 0,
      interviewToHire: 0,
      overallConversion: 0,
    },
    applicationTrends: [],
    topPerformingJobs: [],
    candidateMetrics: {
      topSkills: [],
      experienceDistribution: {},
      topLocations: [],
    },
    responseMetrics: {
      averageResponseTimeDays: 0,
      responseRate: 0,
    },
  });

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const response = await axios.get(
        `${API_URL}/analytics/overview?timeRange=${timeRange}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Performance Analytics
        </h1>

        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "90 Days", value: "90d" },
            { label: "1 Year", value: "1y" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range.value
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Applications"
          value={analytics.overview.totalApplications}
          icon={<Users className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Active Jobs"
          value={analytics.overview.activeJobs}
          icon={<Briefcase className="w-6 h-6" />}
          color="bg-indigo-500"
        />
        <MetricCard
          title="Total Hires"
          value={analytics.overview.totalHires}
          icon={<CheckCircle className="w-6 h-6" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Pending Review"
          value={analytics.overview.pendingReview}
          icon={<Clock className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Conversion Rates */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Conversion Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ConversionMetric
            label="Application → Interview"
            value={`${analytics.conversionRates.applicationToInterview}%`}
            progress={analytics.conversionRates.applicationToInterview}
          />
          <ConversionMetric
            label="Interview → Hire"
            value={`${analytics.conversionRates.interviewToHire}%`}
            progress={analytics.conversionRates.interviewToHire}
          />
          <ConversionMetric
            label="Overall Conversion"
            value={`${analytics.conversionRates.overallConversion}%`}
            progress={analytics.conversionRates.overallConversion}
          />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            Application Trends
          </h3>

          <div className="h-64 flex items-end gap-1">
            {analytics.applicationTrends.map((day, i) => {
              const maxCount = Math.max(
                ...analytics.applicationTrends.map((d) => d.count),
                1
              );
              const height = (day.count / maxCount) * 100;

              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center group relative"
                >
                  <div
                    style={{ height: `${height}%` }}
                    className="w-full bg-indigo-500 rounded-t-sm transition-all hover:bg-indigo-600 cursor-pointer"
                  />

                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {day.label}: {day.count} applications
                  </div>

                  <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left truncate w-16">
                    {day.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Application Status
          </h3>

          <div className="space-y-4">
            {[
              {
                label: "Pending",
                count: analytics.statusBreakdown.pending,
                color: "bg-gray-500",
              },
              {
                label: "Reviewing",
                count: analytics.statusBreakdown.reviewing,
                color: "bg-blue-500",
              },
              {
                label: "Interview",
                count: analytics.statusBreakdown.interview,
                color: "bg-indigo-500",
              },
              {
                label: "Accepted",
                count: analytics.statusBreakdown.accepted,
                color: "bg-green-500",
              },
              {
                label: "Rejected",
                count: analytics.statusBreakdown.rejected,
                color: "bg-red-500",
              },
            ].map((status) => {
              const total = analytics.overview.totalApplications || 1;
              const percentage = ((status.count / total) * 100).toFixed(1);

              return (
                <div key={status.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{status.label}</span>
                    <span className="text-gray-600">
                      {status.count} ({percentage}%)
                    </span>
                  </div>

                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`${status.color} h-2 transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
          Top Performing Jobs
        </h3>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="pb-3">Job Title</th>
                <th className="pb-3">Location</th>
                <th className="pb-3 text-center">Applications</th>
                <th className="pb-3 text-center">Interviews</th>
                <th className="pb-3 text-center">Hired</th>
                <th className="pb-3 text-center">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {analytics.topPerformingJobs.length > 0 ? (
                analytics.topPerformingJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500">{job.type}</div>
                    </td>
                    <td className="py-3 text-sm text-gray-600">
                      {job.location}
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.applicationCount}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {job.interviewCount}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {job.hiredCount}
                      </span>
                    </td>
                    <td className="py-3 text-center font-medium text-gray-900">
                      {job.conversionRate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    No job data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Skills */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Top Candidate Skills</h3>
          <div className="space-y-3">
            {analytics.candidateMetrics.topSkills
              .slice(0, 8)
              .map((skill, index) => {
                const maxCount = analytics.candidateMetrics.topSkills[0]?.count || 1;
                const percentage = ((skill.count / maxCount) * 100).toFixed(0);

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-gray-600">{skill.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-500 h-2"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Experience Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">
            Experience Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(analytics.candidateMetrics.experienceDistribution).map(
              ([level, count]) => {
                const total = Object.values(
                  analytics.candidateMetrics.experienceDistribution
                ).reduce((a, b) => a + b, 0) || 1;
                const percentage = ((count / total) * 100).toFixed(1);

                return (
                  <div key={level}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{level}</span>
                      <span className="text-gray-600">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-green-500 h-2"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Response Metrics */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Response Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-indigo-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600">
              {analytics.responseMetrics.averageResponseTimeDays}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Average Response Time (Days)
            </div>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {analytics.responseMetrics.responseRate}%
            </div>
            <div className="text-sm text-gray-600 mt-1">Response Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
      </div>
    </div>
  );
};

// Conversion Metric Component
const ConversionMetric = ({ label, value, progress }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-lg font-bold text-gray-900">{value}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default Analytics;