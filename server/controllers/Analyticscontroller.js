import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Company from "../models/Company.js";
import JobSeeker from "../models/JobSeeker.js";
import mongoose from "mongoose";

// Get comprehensive analytics overview
export const getAnalyticsOverview = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { timeRange = "7d" } = req.query;

    // Calculate date range
    const dateRanges = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    };
    const daysAgo = dateRanges[timeRange] || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Parallel data fetching for better performance
    const [
      totalApplications,
      applicationsByStatus,
      applicationTrends,
      topPerformingJobs,
      candidateMetrics,
      responseMetrics,
    ] = await Promise.all([
      // Total applications count
      Application.countDocuments({ company: companyId }),

      // Applications by status
      Application.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),

      // Application trends over time
      Application.aggregate([
        {
          $match: {
            company: new mongoose.Types.ObjectId(companyId),
            appliedDate: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$appliedDate" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      // Top performing jobs by application count
      Application.aggregate([
        { $match: { company: new mongoose.Types.ObjectId(companyId) } },
        {
          $group: {
            _id: "$job",
            applicationCount: { $sum: 1 },
            acceptedCount: {
              $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
            },
            interviewCount: {
              $sum: { $cond: [{ $eq: ["$status", "interview"] }, 1, 0] },
            },
          },
        },
        { $sort: { applicationCount: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "jobs",
            localField: "_id",
            foreignField: "_id",
            as: "jobDetails",
          },
        },
        { $unwind: "$jobDetails" },
      ]),

      // Candidate metrics
      getCandidateMetrics(companyId),

      // Response time metrics
      getResponseMetrics(companyId, startDate),
    ]);

    // Format status breakdown
    const statusBreakdown = {
      pending: 0,
      reviewing: 0,
      interview: 0,
      accepted: 0,
      rejected: 0,
    };

    applicationsByStatus.forEach((item) => {
      statusBreakdown[item._id] = item.count;
    });

    // Calculate conversion rates
    const totalApps = totalApplications;
    const conversionRates = {
      applicationToInterview:
        totalApps > 0
          ? ((statusBreakdown.interview / totalApps) * 100).toFixed(1)
          : 0,
      interviewToHire:
        statusBreakdown.interview > 0
          ? (
              (statusBreakdown.accepted / statusBreakdown.interview) *
              100
            ).toFixed(1)
          : 0,
      overallConversion:
        totalApps > 0
          ? ((statusBreakdown.accepted / totalApps) * 100).toFixed(1)
          : 0,
    };

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalApplications,
          activeJobs: await Job.countDocuments({
            company: companyId,
            status: "active",
          }),
          totalHires: statusBreakdown.accepted,
          pendingReview: statusBreakdown.pending,
        },
        statusBreakdown,
        conversionRates,
        applicationTrends: formatTrendData(applicationTrends, daysAgo),
        topPerformingJobs: topPerformingJobs.map((job) => ({
          id: job._id,
          title: job.jobDetails.title,
          location: job.jobDetails.location,
          type: job.jobDetails.type,
          applicationCount: job.applicationCount,
          interviewCount: job.interviewCount,
          hiredCount: job.acceptedCount,
          conversionRate:
            job.applicationCount > 0
              ? ((job.acceptedCount / job.applicationCount) * 100).toFixed(1)
              : 0,
        })),
        candidateMetrics,
        responseMetrics,
      },
    });
  } catch (error) {
    console.error("Analytics overview error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
      error: error.message,
    });
  }
};

// Get application trends with granular time data
export const getApplicationTrends = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { timeRange = "30d", groupBy = "day" } = req.query;

    const dateRanges = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    };
    const daysAgo = dateRanges[timeRange] || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Determine date format based on groupBy
    const dateFormats = {
      day: "%Y-%m-%d",
      week: "%Y-W%V",
      month: "%Y-%m",
    };

    const trends = await Application.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
          appliedDate: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: dateFormats[groupBy] || dateFormats.day,
                date: "$appliedDate",
              },
            },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    // Transform data for frontend
    const formattedTrends = formatTrendsByStatus(trends, daysAgo, groupBy);

    res.status(200).json({
      success: true,
      data: formattedTrends,
    });
  } catch (error) {
    console.error("Application trends error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application trends",
      error: error.message,
    });
  }
};

// Get job performance analytics
export const getJobPerformanceAnalytics = async (req, res) => {
  try {
    const companyId = req.user.id;
    const { sortBy = "applications", limit = 10 } = req.query;

    const sortCriteria = {
      applications: { applicationCount: -1 },
      conversion: { conversionRate: -1 },
      recent: { "jobDetails.postedDate": -1 },
    };

    const jobPerformance = await Application.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: "$job",
          applicationCount: { $sum: 1 },
          pendingCount: {
            $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
          },
          reviewingCount: {
            $sum: { $cond: [{ $eq: ["$status", "reviewing"] }, 1, 0] },
          },
          interviewCount: {
            $sum: { $cond: [{ $eq: ["$status", "interview"] }, 1, 0] },
          },
          acceptedCount: {
            $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] },
          },
          rejectedCount: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "jobs",
          localField: "_id",
          foreignField: "_id",
          as: "jobDetails",
        },
      },
      { $unwind: "$jobDetails" },
      {
        $addFields: {
          conversionRate: {
            $multiply: [
              { $divide: ["$acceptedCount", "$applicationCount"] },
              100,
            ],
          },
        },
      },
      { $sort: sortCriteria[sortBy] || sortCriteria.applications },
      { $limit: parseInt(limit) },
    ]);

    res.status(200).json({
      success: true,
      data: jobPerformance.map((job) => ({
        id: job._id,
        title: job.jobDetails.title,
        location: job.jobDetails.location,
        type: job.jobDetails.type,
        status: job.jobDetails.status,
        postedDate: job.jobDetails.postedDate,
        metrics: {
          totalApplications: job.applicationCount,
          pending: job.pendingCount,
          reviewing: job.reviewingCount,
          interview: job.interviewCount,
          accepted: job.acceptedCount,
          rejected: job.rejectedCount,
          conversionRate: job.conversionRate.toFixed(1),
        },
      })),
    });
  } catch (error) {
    console.error("Job performance analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch job performance analytics",
      error: error.message,
    });
  }
};

// Get candidate analytics
export const getCandidateAnalytics = async (req, res) => {
  try {
    const companyId = req.user.id;

    const candidateData = await getCandidateMetrics(companyId);

    res.status(200).json({
      success: true,
      data: candidateData,
    });
  } catch (error) {
    console.error("Candidate analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch candidate analytics",
      error: error.message,
    });
  }
};

// Get sourcing analytics
export const getSourcingAnalytics = async (req, res) => {
  try {
    const companyId = req.user.id;

    // For now, return mock data - you can implement actual tracking later
    // This would require adding a 'source' field to Application model
    const sourcingData = {
      channels: [
        { name: "LinkedIn", applications: 0, hires: 0, percentage: 45 },
        { name: "Indeed", applications: 0, hires: 0, percentage: 30 },
        { name: "Direct Referral", applications: 0, hires: 0, percentage: 15 },
        { name: "Company Website", applications: 0, hires: 0, percentage: 5 },
        { name: "Other", applications: 0, hires: 0, percentage: 5 },
      ],
      totalApplications: await Application.countDocuments({
        company: companyId,
      }),
    };

    res.status(200).json({
      success: true,
      data: sourcingData,
      note: "Sourcing tracking not implemented yet. Add 'source' field to Application model to track this data.",
    });
  } catch (error) {
    console.error("Sourcing analytics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch sourcing analytics",
      error: error.message,
    });
  }
};

// Get time-to-hire metrics
export const getTimeToHireMetrics = async (req, res) => {
  try {
    const companyId = req.user.id;

    const hiredApplications = await Application.find({
      company: companyId,
      status: "accepted",
    })
      .select("appliedDate statusHistory")
      .limit(100);

    const timeToHireData = hiredApplications
      .map((app) => {
        const hiredStatus = app.statusHistory.find(
          (h) => h.status === "accepted"
        );
        if (hiredStatus) {
          const days = Math.floor(
            (new Date(hiredStatus.updatedAt) - new Date(app.appliedDate)) /
              (1000 * 60 * 60 * 24)
          );
          return days;
        }
        return null;
      })
      .filter((d) => d !== null);

    const avgTimeToHire =
      timeToHireData.length > 0
        ? (
            timeToHireData.reduce((a, b) => a + b, 0) / timeToHireData.length
          ).toFixed(1)
        : 0;

    const minTimeToHire =
      timeToHireData.length > 0 ? Math.min(...timeToHireData) : 0;
    const maxTimeToHire =
      timeToHireData.length > 0 ? Math.max(...timeToHireData) : 0;

    res.status(200).json({
      success: true,
      data: {
        averageDays: avgTimeToHire,
        minimumDays: minTimeToHire,
        maximumDays: maxTimeToHire,
        totalHires: timeToHireData.length,
        distribution: createDistribution(timeToHireData),
      },
    });
  } catch (error) {
    console.error("Time to hire metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch time-to-hire metrics",
      error: error.message,
    });
  }
};

// Helper Functions

async function getCandidateMetrics(companyId) {
  const applications = await Application.find({ company: companyId })
    .populate({
      path: "jobSeeker",
      select: "skills experience location",
    })
    .limit(500);

  // Skills distribution
  const skillsMap = {};
  applications.forEach((app) => {
    if (app.jobSeeker?.skills) {
      app.jobSeeker.skills.forEach((skill) => {
        skillsMap[skill] = (skillsMap[skill] || 0) + 1;
      });
    }
  });

  const topSkills = Object.entries(skillsMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([skill, count]) => ({ skill, count }));

  // Experience distribution
  const experienceLevels = {
    "0-2 years": 0,
    "3-5 years": 0,
    "6-10 years": 0,
    "10+ years": 0,
  };

  applications.forEach((app) => {
    if (app.jobSeeker?.experience) {
      const totalYears = calculateTotalYears(app.jobSeeker.experience);
      if (totalYears <= 2) experienceLevels["0-2 years"]++;
      else if (totalYears <= 5) experienceLevels["3-5 years"]++;
      else if (totalYears <= 10) experienceLevels["6-10 years"]++;
      else experienceLevels["10+ years"]++;
    }
  });

  // Location distribution
  const locationMap = {};
  applications.forEach((app) => {
    if (app.jobSeeker?.location) {
      const location = app.jobSeeker.location;
      locationMap[location] = (locationMap[location] || 0) + 1;
    }
  });

  const topLocations = Object.entries(locationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([location, count]) => ({ location, count }));

  return {
    topSkills,
    experienceDistribution: experienceLevels,
    topLocations,
    totalCandidates: applications.length,
  };
}

async function getResponseMetrics(companyId, startDate) {
  const applications = await Application.find({
    company: companyId,
    appliedDate: { $gte: startDate },
  }).select("appliedDate statusHistory status");

  let totalResponseTime = 0;
  let responsesCount = 0;

  applications.forEach((app) => {
    if (app.statusHistory && app.statusHistory.length > 0) {
      const firstResponse = app.statusHistory[0];
      const responseTime =
        (new Date(firstResponse.updatedAt) - new Date(app.appliedDate)) /
        (1000 * 60 * 60); // in hours
      totalResponseTime += responseTime;
      responsesCount++;
    }
  });

  const avgResponseTime =
    responsesCount > 0 ? totalResponseTime / responsesCount : 0;

  return {
    averageResponseTimeHours: avgResponseTime.toFixed(1),
    averageResponseTimeDays: (avgResponseTime / 24).toFixed(1),
    totalResponded: responsesCount,
    responseRate:
      applications.length > 0
        ? ((responsesCount / applications.length) * 100).toFixed(1)
        : 0,
  };
}

function calculateTotalYears(experienceArray) {
  if (!Array.isArray(experienceArray)) return 0;

  let totalMonths = 0;
  experienceArray.forEach((exp) => {
    if (exp.startDate) {
      const start = new Date(exp.startDate);
      const end = exp.current
        ? new Date()
        : exp.endDate
        ? new Date(exp.endDate)
        : new Date();
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());
      totalMonths += months;
    }
  });

  return totalMonths / 12;
}

function formatTrendData(trends, daysAgo) {
  const dateMap = {};

  trends.forEach((item) => {
    dateMap[item._id] = item.count;
  });

  // Fill in missing dates
  const result = [];
  const today = new Date();

  for (let i = daysAgo - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    result.push({
      date: dateStr,
      count: dateMap[dateStr] || 0,
      label: formatDateLabel(date, i, daysAgo),
    });
  }

  return result;
}

function formatTrendsByStatus(trends, daysAgo, groupBy) {
  const dateMap = {};

  trends.forEach((item) => {
    if (!dateMap[item._id.date]) {
      dateMap[item._id.date] = {
        date: item._id.date,
        pending: 0,
        reviewing: 0,
        interview: 0,
        accepted: 0,
        rejected: 0,
      };
    }
    dateMap[item._id.date][item._id.status] = item.count;
  });

  return Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));
}

function formatDateLabel(date, daysBack, totalDays) {
  if (totalDays <= 7) {
    return `Day ${totalDays - daysBack}`;
  } else if (totalDays <= 30) {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } else {
    return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  }
}

function createDistribution(data) {
  const ranges = {
    "0-7 days": 0,
    "8-14 days": 0,
    "15-30 days": 0,
    "31-60 days": 0,
    "60+ days": 0,
  };

  data.forEach((days) => {
    if (days <= 7) ranges["0-7 days"]++;
    else if (days <= 14) ranges["8-14 days"]++;
    else if (days <= 30) ranges["15-30 days"]++;
    else if (days <= 60) ranges["31-60 days"]++;
    else ranges["60+ days"]++;
  });

  return ranges;
}