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
        setAnalytics(response.data.data);
      }
    } catch (error) {
      console.error("❌ Failed to fetch analytics:", error);
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

  const maxCount = Math.max(...analytics.applicationTrends.map(d => d.count), 1);
  const totalApps = analytics.applicationTrends.reduce((sum, day) => sum + day.count, 0);

  // Smart grouping based on time range
  const getGroupedTrends = () => {
    if (timeRange === "7d") {
      // Show each day for 7 days
      return analytics.applicationTrends.map(day => ({
        label: new Date(day.date).toLocaleDateString("en-US", { 
          weekday: "short",
          month: "short", 
          day: "numeric" 
        }),
        count: day.count,
      }));
    } else if (timeRange === "30d") {
      // Show weekly totals with date ranges
      const weeks = [];
      for (let i = 0; i < analytics.applicationTrends.length; i += 7) {
        const weekData = analytics.applicationTrends.slice(i, i + 7);
        if (weekData.length === 0) continue;
        
        const firstDay = new Date(weekData[0].date);
        const lastDay = new Date(weekData[weekData.length - 1].date);
        const count = weekData.reduce((sum, d) => sum + d.count, 0);
        
        weeks.push({
          label: `${firstDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${lastDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
          count: count,
        });
      }
      return weeks;
    } else if (timeRange === "90d") {
      // Show monthly totals
      const months = {};
      analytics.applicationTrends.forEach(day => {
        const monthKey = new Date(day.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        if (!months[monthKey]) {
          months[monthKey] = { label: monthKey, count: 0 };
        }
        months[monthKey].count += day.count;
      });
      return Object.values(months);
    } else {
      // For 1 year, show monthly
      const months = {};
      analytics.applicationTrends.forEach(day => {
        const monthKey = new Date(day.date).toLocaleDateString("en-US", { month: "short", year: "numeric" });
        if (!months[monthKey]) {
          months[monthKey] = { label: monthKey, count: 0 };
        }
        months[monthKey].count += day.count;
      });
      return Object.values(months);
    }
  };

  const groupedTrends = getGroupedTrends();
  const groupedMaxCount = Math.max(...groupedTrends.map(g => g.count), 1);

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
        {/* Application Trends - WITH PROPER DATES */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Application Trends
            </h3>
            <span className="text-sm text-gray-500">
              Total: {totalApps}
            </span>
          </div>

          <div className="space-y-3">
            {groupedTrends.length > 0 ? (
              groupedTrends.map((item, idx) => {
                const percentage = groupedMaxCount > 0 
                  ? Math.max(((item.count / groupedMaxCount) * 100), item.count > 0 ? 5 : 0).toFixed(1)
                  : 0;
                
                return (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{item.label}</span>
                      <span className="text-gray-600">
                        {item.count} {item.count === 1 ? 'application' : 'applications'}
                      </span>
                    </div>

                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-3 transition-all duration-500 rounded-full ${
                          item.count === 0 
                            ? 'bg-gray-300' 
                            : item.count <= groupedMaxCount / 3
                            ? 'bg-indigo-400'
                            : item.count <= (groupedMaxCount * 2) / 3
                            ? 'bg-indigo-500'
                            : 'bg-indigo-600'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-400 py-8">
                <p className="text-sm">No application data available</p>
              </div>
            )}
          </div>

          {/* Period Info */}
          <div className="mt-4 pt-3 border-t border-gray-100 text-xs text-gray-500 text-center">
            {timeRange === "7d" && "Showing daily breakdown"}
            {timeRange === "30d" && "Showing weekly totals"}
            {(timeRange === "90d" || timeRange === "1y") && "Showing monthly totals"}
          </div>
        </div>

        {/* Application Status Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-600" />
            Application Status
          </h3>

          <div className="space-y-4">
            {[
              { label: "Pending", count: analytics.statusBreakdown.pending, color: "bg-gray-500" },
              { label: "Reviewing", count: analytics.statusBreakdown.reviewing, color: "bg-blue-500" },
              { label: "Interview", count: analytics.statusBreakdown.interview, color: "bg-indigo-500" },
              { label: "Accepted", count: analytics.statusBreakdown.accepted, color: "bg-green-500" },
              { label: "Rejected", count: analytics.statusBreakdown.rejected, color: "bg-red-500" },
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
                    <td className="py-3 text-sm text-gray-600 hidden sm:table-cell">{job.location}</td>
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
                    <td className="py-3 text-center font-medium text-sm">{job.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Candidate Insights */}
      {analytics.candidateMetrics?.topSkills?.length > 0 && (
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
              {Object.entries(analytics.candidateMetrics.experienceDistribution).map(([level, count]) => {
                const total = Object.values(analytics.candidateMetrics.experienceDistribution).reduce((a, b) => a + b, 0) || 1;
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
              })}
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
        <div className={`${color} p-2 sm:p-3 rounded-lg text-white flex-shrink-0 ml-2`}>{icon}</div>
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