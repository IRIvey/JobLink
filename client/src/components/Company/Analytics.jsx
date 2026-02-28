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
        console.log("✅ Analytics data loaded:", response.data.data);
        console.log("📊 Application trends:", response.data.data.applicationTrends);
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("❌ Failed to fetch analytics:", error);
      console.error("Error details:", error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const formatChartDate = (dateStr, index, total) => {
    const date = new Date(dateStr);
    
    if (timeRange === "7d") {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else if (timeRange === "30d") {
      if (index % 5 === 0 || index === total - 1) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return "";
    } else if (timeRange === "90d") {
      if (index % 10 === 0 || index === total - 1) {
        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return "";
    } else {
      if (index % 30 === 0 || index === total - 1) {
        return date.toLocaleDateString("en-US", { month: "short" });
      }
      return "";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const maxCount = analytics.applicationTrends.length > 0
    ? Math.max(...analytics.applicationTrends.map((d) => d.count))
    : 0;
  const totalApps = analytics.applicationTrends.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Performance Analytics
        </h1>

        <div className="flex gap-2 flex-wrap">
          {[
            { label: "7 Days", value: "7d" },
            { label: "30 Days", value: "30d" },
            { label: "90 Days", value: "90d" },
            { label: "1 Year", value: "1y" },
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Total Applications"
          value={analytics.overview.totalApplications}
          icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="bg-blue-500"
        />
        <MetricCard
          title="Active Jobs"
          value={analytics.overview.activeJobs}
          icon={<Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="bg-indigo-500"
        />
        <MetricCard
          title="Total Hires"
          value={analytics.overview.totalHires}
          icon={<CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="bg-green-500"
        />
        <MetricCard
          title="Pending Review"
          value={analytics.overview.pendingReview}
          icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
          color="bg-orange-500"
        />
      </div>

      {/* Conversion Rates */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-600" />
          Conversion Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Application Trends - ENHANCED FOR LOW COUNTS */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Application Trends
            </h3>
            {analytics.applicationTrends.length > 0 && (
              <span className="text-sm text-gray-500">
                Total: {totalApps} applications
              </span>
            )}
          </div>

          {analytics.applicationTrends && analytics.applicationTrends.length > 0 ? (
            <div className="space-y-3">
              {/* Chart Container */}
              <div className="h-64 relative bg-gradient-to-t from-gray-50 to-white rounded-lg p-4">
                {/* Y-axis */}
                <div className="absolute left-2 top-4 bottom-12 flex flex-col justify-between text-xs text-gray-500 font-medium">
                  <span>{maxCount}</span>
                  <span>{Math.ceil(maxCount / 2)}</span>
                  <span>0</span>
                </div>

                {/* Grid lines */}
                <div className="absolute left-12 right-4 top-4 bottom-12">
                  <div className="h-full relative">
                    <div className="absolute w-full border-t border-gray-200" style={{ top: "0%" }}></div>
                    <div className="absolute w-full border-t border-gray-200" style={{ top: "50%" }}></div>
                    <div className="absolute w-full border-t border-gray-300" style={{ top: "100%" }}></div>
                  </div>
                </div>

                {/* Bars */}
                <div className="absolute left-12 right-4 top-4 bottom-12 flex items-end gap-0.5">
                  {analytics.applicationTrends.map((day, i) => {
                    // ENHANCED: Much more aggressive minimum heights
                    let height;
                    if (day.count === 0) {
                      height = 1; // Tiny bar for empty days
                    } else if (maxCount <= 5) {
                      // For very low counts, use larger minimum percentages
                      height = Math.max((day.count / Math.max(maxCount, 1)) * 100, 20);
                    } else {
                      height = Math.max((day.count / maxCount) * 100, 10);
                    }

                    // Color based on value
                    const barColor = day.count === 0
                      ? "bg-gray-200"
                      : day.count === 1
                      ? "bg-indigo-400"
                      : day.count === 2
                      ? "bg-indigo-500"
                      : day.count === 3
                      ? "bg-indigo-600"
                      : day.count < maxCount / 2
                      ? "bg-indigo-500"
                      : "bg-indigo-700";

                    return (
                      <div
                        key={i}
                        className="flex-1 flex flex-col items-center group relative"
                        style={{ minWidth: "3px" }}
                      >
                        {/* Enhanced Tooltip */}
                        <div className="absolute bottom-full mb-3 hidden group-hover:flex bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-20 flex-col items-center shadow-xl">
                          <span className="font-bold text-base text-indigo-300">{day.count}</span>
                          <span className="text-[10px] text-gray-300 mt-0.5">{day.label}</span>
                          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45"></div>
                        </div>

                        {/* Bar with glow effect */}
                        <div
                          style={{ height: `${height}%` }}
                          className={`w-full ${barColor} rounded-t-md transition-all duration-200 hover:opacity-80 cursor-pointer relative ${
                            day.count > 0 ? 'shadow-lg' : ''
                          }`}
                          title={`${day.date}: ${day.count} apps`}
                        >
                          {/* Glow effect for non-zero bars */}
                          {day.count > 0 && (
                            <div className="absolute inset-0 bg-white opacity-20 rounded-t-md"></div>
                          )}
                        </div>

                        {/* Count label on hover */}
                        {day.count > 0 && (
                          <div className="absolute -top-6 hidden group-hover:block bg-indigo-600 text-white text-xs font-bold rounded px-1.5 py-0.5">
                            {day.count}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* X-axis labels */}
              <div className="ml-12 mr-4 flex justify-between text-xs text-gray-500">
                {analytics.applicationTrends.map((day, i) => {
                  const label = formatChartDate(day.date, i, analytics.applicationTrends.length);
                  return label ? (
                    <span key={i} className="text-center flex-shrink-0">
                      {label}
                    </span>
                  ) : (
                    <span key={i} className="flex-1"></span>
                  );
                })}
              </div>

              {/* Info message for low counts */}
              {maxCount <= 5 && totalApps > 0 && (
                <div className="text-xs text-gray-500 text-center mt-2 bg-blue-50 py-2 px-3 rounded">
                  💡 Tip: Bars are enlarged for better visibility with low application counts
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400">
              <Activity className="w-12 h-12 mb-2 opacity-50" />
              <p className="text-sm">No application data for this period</p>
              <p className="text-xs mt-1">Try selecting a different time range</p>
            </div>
          )}
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Application Status
          </h3>

          <div className="space-y-3 sm:space-y-4">
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
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
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
      {analytics.topPerformingJobs && analytics.topPerformingJobs.length > 0 && (
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Top Performing Jobs
          </h3>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-left text-xs font-medium text-gray-500 uppercase">
                  <th className="pb-3">Job Title</th>
                  <th className="pb-3 hidden sm:table-cell">Location</th>
                  <th className="pb-3 text-center">Apps</th>
                  <th className="pb-3 text-center hidden md:table-cell">Interviews</th>
                  <th className="pb-3 text-center">Hired</th>
                  <th className="pb-3 text-center">Conv.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {analytics.topPerformingJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div className="font-medium text-sm">{job.title}</div>
                      <div className="text-xs text-gray-500 sm:hidden">{job.location}</div>
                    </td>
                    <td className="py-3 text-sm text-gray-600 hidden sm:table-cell">
                      {job.location}
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {job.applicationCount}
                      </span>
                    </td>
                    <td className="py-3 text-center hidden md:table-cell">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {job.interviewCount}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {job.hiredCount}
                      </span>
                    </td>
                    <td className="py-3 text-center font-medium text-sm">
                      {job.conversionRate}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Insights */}
      {analytics.candidateMetrics && analytics.candidateMetrics.topSkills && analytics.candidateMetrics.topSkills.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Top Candidate Skills</h3>
            <div className="space-y-3">
              {analytics.candidateMetrics.topSkills.slice(0, 8).map((skill, index) => {
                const maxSkillCount = analytics.candidateMetrics.topSkills[0]?.count || 1;
                const percentage = ((skill.count / maxSkillCount) * 100).toFixed(0);

                return (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{skill.skill}</span>
                      <span className="text-gray-600">{skill.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Experience Distribution</h3>
            <div className="space-y-3">
              {Object.entries(analytics.candidateMetrics.experienceDistribution).map(
                ([level, count]) => {
                  const total = Object.values(analytics.candidateMetrics.experienceDistribution)
                    .reduce((a, b) => a + b, 0) || 1;
                  const percentage = ((count / total) * 100).toFixed(1);

                  return (
                    <div key={level}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{level}</span>
                        <span className="text-gray-600">{count} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
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
      )}

      {/* Response Metrics */}
      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold mb-4">Response Performance</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="text-center p-6 bg-indigo-50 rounded-lg">
            <div className="text-3xl font-bold text-indigo-600">
              {analytics.responseMetrics.averageResponseTimeDays}
            </div>
            <div className="text-sm text-gray-600 mt-1">Average Response Time (Days)</div>
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

const MetricCard = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`${color} p-2 sm:p-3 rounded-lg text-white flex-shrink-0 ml-2`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const ConversionMetric = ({ label, value, progress }) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs sm:text-sm font-medium text-gray-700">{label}</span>
        <span className="text-base sm:text-lg font-bold text-gray-900">{value}</span>
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