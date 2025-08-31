const express = require("express");
const Report = require("../models/Report");
const User = require("../models/User");
const { auth, hasPermission } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview statistics
// @access  Private
router.get(
  "/overview",
  [auth, hasPermission("view_dashboard")],
  async (req, res) => {
    try {
      // Get basic statistics
      const totalReports = await Report.countDocuments();
      const totalUsers = await User.countDocuments({ isActive: true });

      // Get reports by status
      const reportsByStatus = await Report.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get reports by category
      const reportsByCategory = await Report.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get reports by severity
      const reportsBySeverity = await Report.aggregate([
        {
          $group: {
            _id: "$severity",
            count: { $sum: 1 },
          },
        },
      ]);

      // Get reports for current and previous month
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

      // Get this month's statistics
      const thisMonthReports = await Report.countDocuments({
        createdAt: { $gte: thisMonthStart },
      });
      const thisMonthUsers = await User.countDocuments({
        createdAt: { $gte: thisMonthStart },
        isActive: true,
      });
      const thisMonthValidated = await Report.countDocuments({
        createdAt: { $gte: thisMonthStart },
        status: "validated",
      });
      const thisMonthUrgent = await Report.countDocuments({
        createdAt: { $gte: thisMonthStart },
        $or: [{ severity: "critical" }, { isUrgent: true }],
      });

      // Get last month's statistics
      const lastMonthReports = await Report.countDocuments({
        createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
      });
      const lastMonthUsers = await User.countDocuments({
        createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
        isActive: true,
      });
      const lastMonthValidated = await Report.countDocuments({
        createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
        status: "validated",
      });
      const lastMonthUrgent = await Report.countDocuments({
        createdAt: { $gte: lastMonthStart, $lt: thisMonthStart },
        $or: [{ severity: "critical" }, { isUrgent: true }],
      });

      // Calculate percentage changes
      const calculatePercentChange = (current, previous) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return (((current - previous) / previous) * 100).toFixed(1);
      };

      const reportsChange = calculatePercentChange(
        thisMonthReports,
        lastMonthReports
      );
      const usersChange = calculatePercentChange(
        thisMonthUsers,
        lastMonthUsers
      );
      const validatedChange = calculatePercentChange(
        thisMonthValidated,
        lastMonthValidated
      );
      const urgentChange = calculatePercentChange(
        thisMonthUrgent,
        lastMonthUrgent
      );

      // Get top contributors
      const topContributors = await User.find({ isActive: true })
        .sort({ points: -1 })
        .limit(5)
        .select("firstName lastName avatar points level badges");

      // Get urgent reports count
      const urgentReports = await Report.countDocuments({
        $or: [{ severity: "critical" }, { isUrgent: true }],
      });

      // Get average validation score
      const avgValidationScore = await Report.aggregate([
        {
          $group: {
            _id: null,
            avgScore: { $avg: "$validationScore" },
          },
        },
      ]);

      res.json({
        success: true,
        data: {
          overview: {
            totalReports,
            totalUsers,
            urgentReports,
            reportsChange,
            usersChange,
            validatedChange,
            urgentChange,
            thisMonthReports,
            thisMonthUsers,
            thisMonthValidated,
            thisMonthUrgent,
            avgValidationScore: avgValidationScore[0]?.avgScore || 0,
          },
          reportsByStatus: reportsByStatus.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          reportsByCategory: reportsByCategory.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          reportsBySeverity: reportsBySeverity.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
          }, {}),
          topContributors,
        },
      });
    } catch (error) {
      console.error("Dashboard overview error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching dashboard overview",
      });
    }
  }
);

// @route   GET /api/dashboard/analytics
// @desc    Get detailed analytics data
// @access  Private
router.get(
  "/analytics",
  [auth, hasPermission("view_analytics")],
  async (req, res) => {
    try {
      const { period = "30", type = "reports" } = req.query;

      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      let analyticsData = {};

      if (type === "reports") {
        // Reports over time
        const reportsOverTime = await Report.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);

        // Reports by location (top areas)
        const reportsByLocation = await Report.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                city: "$location.address.city",
                state: "$location.address.state",
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { count: -1 },
          },
          {
            $limit: 10,
          },
        ]);

        analyticsData = {
          reportsOverTime,
          reportsByLocation,
        };
      } else if (type === "users") {
        // User registration over time
        const usersOverTime = await User.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              count: { $sum: 1 },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);

        // Users by role
        const usersByRole = await User.aggregate([
          {
            $match: {
              isActive: true,
            },
          },
          {
            $group: {
              _id: "$role",
              count: { $sum: 1 },
            },
          },
        ]);

        analyticsData = {
          usersOverTime,
          usersByRole,
        };
      } else if (type === "performance") {
        // Validation performance over time
        const validationPerformance = await Report.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              avgValidationScore: { $avg: "$validationScore" },
              totalReports: { $sum: 1 },
              validatedReports: {
                $sum: {
                  $cond: [{ $eq: ["$status", "validated"] }, 1, 0],
                },
              },
            },
          },
          {
            $sort: { _id: 1 },
          },
        ]);

        analyticsData = {
          validationPerformance,
        };
      }

      res.json({
        success: true,
        data: analyticsData,
      });
    } catch (error) {
      console.error("Dashboard analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching analytics",
      });
    }
  }
);

// @route   GET /api/dashboard/heatmap
// @desc    Get incident heatmap data
// @access  Private
router.get(
  "/heatmap",
  [auth, hasPermission("view_dashboard")],
  async (req, res) => {
    try {
      const { category, severity, dateFrom, dateTo } = req.query;

      // Build filter
      const filter = {};

      if (category) filter.category = category;
      if (severity) filter.severity = severity;

      if (dateFrom || dateTo) {
        filter.incidentDate = {};
        if (dateFrom) filter.incidentDate.$gte = new Date(dateFrom);
        if (dateTo) filter.incidentDate.$lte = new Date(dateTo);
      }

      // Get reports with coordinates
      const heatmapData = await Report.find({
        ...filter,
        "location.coordinates": { $exists: true, $ne: null },
      })
        .select("location category severity status incidentDate")
        .limit(1000); // Limit for performance

      // Group by coordinates (aggregate nearby points)
      const aggregatedData = {};

      heatmapData.forEach((report) => {
        const coords = report.location.coordinates;
        const key = `${Math.round(coords[0] * 100) / 100},${
          Math.round(coords[1] * 100) / 100
        }`;

        if (!aggregatedData[key]) {
          aggregatedData[key] = {
            coordinates: coords,
            count: 0,
            categories: {},
            severities: {},
            statuses: {},
          };
        }

        aggregatedData[key].count++;

        // Count by category
        if (!aggregatedData[key].categories[report.category]) {
          aggregatedData[key].categories[report.category] = 0;
        }
        aggregatedData[key].categories[report.category]++;

        // Count by severity
        if (!aggregatedData[key].severities[report.severity]) {
          aggregatedData[key].severities[report.severity] = 0;
        }
        aggregatedData[key].severities[report.severity]++;

        // Count by status
        if (!aggregatedData[key].statuses[report.status]) {
          aggregatedData[key].statuses[report.status] = 0;
        }
        aggregatedData[key].statuses[report.status]++;
      });

      const heatmapPoints = Object.values(aggregatedData).map((point) => ({
        coordinates: point.coordinates,
        count: point.count,
        categories: point.categories,
        severities: point.severities,
        statuses: point.statuses,
        intensity: Math.min(point.count / 10, 1), // Normalize intensity
      }));

      res.json({
        success: true,
        data: {
          heatmapPoints,
          totalPoints: heatmapPoints.length,
          maxIntensity: Math.max(...heatmapPoints.map((p) => p.count)),
        },
      });
    } catch (error) {
      console.error("Dashboard heatmap error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching heatmap data",
      });
    }
  }
);

// @route   GET /api/dashboard/trends
// @desc    Get trend analysis data
// @access  Private
router.get(
  "/trends",
  [auth, hasPermission("view_analytics")],
  async (req, res) => {
    try {
      const { period = "90" } = req.query;
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Monthly trends
      const monthlyTrends = await Report.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
            avgValidationScore: { $avg: "$validationScore" },
            categories: { $addToSet: "$category" },
            severities: { $addToSet: "$severity" },
          },
        },
        {
          $sort: { "_id.year": 1, "_id.month": 1 },
        },
      ]);

      // Category trends over time
      const categoryTrends = await Report.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              category: "$category",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.date": 1 },
        },
      ]);

      // Severity trends over time
      const severityTrends = await Report.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
              severity: "$severity",
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { "_id.date": 1 },
        },
      ]);

      // User engagement trends
      const userEngagementTrends = await User.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
            },
            newUsers: { $sum: 1 },
            totalPoints: { $sum: "$points" },
          },
        },
        {
          $sort: { "_id.date": 1 },
        },
      ]);

      res.json({
        success: true,
        data: {
          monthlyTrends,
          categoryTrends,
          severityTrends,
          userEngagementTrends,
        },
      });
    } catch (error) {
      console.error("Dashboard trends error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while fetching trends data",
      });
    }
  }
);

// @route   GET /api/dashboard/export
// @desc    Export dashboard data
// @access  Private
router.get(
  "/export",
  [auth, hasPermission("export_data")],
  async (req, res) => {
    try {
      const { format = "json", type = "reports", filters } = req.query;

      let data = {};
      let filename = "";

      if (type === "reports") {
        const reports = await Report.find(JSON.parse(filters || "{}"))
          .populate("reporter", "firstName lastName email")
          .populate("reviewedBy", "firstName lastName role");

        data = reports;
        filename = `reports_${new Date().toISOString().split("T")[0]}`;
      } else if (type === "users") {
        const users = await User.find({ isActive: true }).select("-password");

        data = users;
        filename = `users_${new Date().toISOString().split("T")[0]}`;
      } else if (type === "analytics") {
        // Get analytics data for export
        const analytics = await Report.aggregate([
          {
            $group: {
              _id: null,
              totalReports: { $sum: 1 },
              avgValidationScore: { $avg: "$validationScore" },
              reportsByStatus: {
                $push: {
                  status: "$status",
                  count: 1,
                },
              },
              reportsByCategory: {
                $push: {
                  category: "$category",
                  count: 1,
                },
              },
            },
          },
        ]);

        data = analytics[0];
        filename = `analytics_${new Date().toISOString().split("T")[0]}`;
      }

      if (format === "csv") {
        // Convert to CSV format
        const csv = convertToCSV(data);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.csv"`
        );
        res.send(csv);
      } else {
        // JSON format
        res.setHeader("Content-Type", "application/json");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${filename}.json"`
        );
        res.json({
          success: true,
          data,
          exportedAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Dashboard export error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while exporting data",
      });
    }
  }
);

// Helper function to convert data to CSV
const convertToCSV = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return "";
  }

  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")];

  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header];
      if (typeof value === "object") {
        return JSON.stringify(value);
      }
      return value;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

module.exports = router;
