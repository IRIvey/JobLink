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