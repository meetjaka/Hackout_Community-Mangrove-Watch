const express = require("express");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createReport } = require("../services/reportService");
const Report = require("../models/Report");
const User = require("../models/User");
const { auth, authorize, hasPermission } = require("../middleware/auth");
const sendEmail = require("../utils/email");
const sendSMS = require("../utils/sms");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/reports");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|wmv/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image and video files are allowed!"));
    }
  },
});

// @route   POST /api/reports
// @desc    Create a new incident report
// @access  Private
router.post("/", [
  auth,
  hasPermission("create_report"),
  upload.array("media", 10),
  body("title")
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage("Title must be between 5 and 200 characters"),
  body("description")
    .trim()
    .isLength({ min: 20, max: 2000 })
    .withMessage("Description must be between 20 and 2000 characters"),
  body("category")
    .isIn([
      "illegal_cutting",
      "land_reclamation",
      "pollution",
      "dumping",
      "construction",
      "other"
    ])
    .withMessage("Invalid category"),
  body("location")
    .custom((value) => {
      if (typeof value === "string") {
        try {
          value = JSON.parse(value);
        } catch (e) {
          throw new Error("Invalid location data format");
        }
      }
      if (!value || !value.coordinates || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
        throw new Error("Location must include valid coordinates [longitude, latitude]");
      }
      return true;
    })
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array()
      });
    }

    // Create report using service
    const report = await createReport(req.body, req.files, req.user);

    // Return success response
    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: {
        reportId: report._id,
        title: report.title,
        status: report.status
      }
    });
  } catch (error) {
    console.error("Report submission error:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server error during report creation"
    });
  }
});

// @route   GET /api/reports
// @desc    Get all reports with filtering and pagination
// @access  Private
router.get("/", [auth, hasPermission("view_reports")], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      status,
      severity,
      location,
      dateFrom,
      dateTo,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build filter object
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (severity) filter.severity = severity;

    if (location) {
      filter.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: location.split(",").map(Number),
          },
          $maxDistance: 10000, // 10km radius
        },
      };
    }

    if (dateFrom || dateTo) {
      filter.incidentDate = {};
      if (dateFrom) filter.incidentDate.$gte = new Date(dateFrom);
      if (dateTo) filter.incidentDate.$lte = new Date(dateTo);
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reports = await Report.find(filter)
      .populate("reporter", "firstName lastName avatar")
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalReports: total,
          hasNextPage: skip + reports.length < total,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching reports",
    });
  }
});

// @route   GET /api/reports/:id
// @desc    Get a specific report by ID
// @access  Private
router.get("/:id", [auth, hasPermission("view_reports")], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate("reporter", "firstName lastName avatar bio organization")
      .populate("reviewedBy", "firstName lastName role organization");

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    console.error("Get report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching report",
    });
  }
});

// @route   PUT /api/reports/:id
// @desc    Update a report
// @access  Private
router.put("/:id", [auth, upload.array("media", 10)], async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if user can edit this report
    if (!report.canBeEditedBy(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to edit this report",
      });
    }

    // Update allowed fields
    const allowedUpdates = [
      "title",
      "description",
      "subCategory",
      "severity",
      "address",
      "estimatedArea",
      "estimatedDamage",
      "environmentalImpact",
      "tags",
    ];

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        report[field] = req.body[field];
      }
    });

    // Process new media files
    if (req.files && req.files.length > 0) {
      req.files.forEach((file, index) => {
        const isVideo = /video/.test(file.mimetype);
        if (isVideo) {
          report.videos.push({
            url: `/uploads/reports/${file.filename}`,
            caption: req.body[`mediaCaption_${index}`] || "",
            duration: null,
          });
        } else {
          report.photos.push({
            url: `/uploads/reports/${file.filename}`,
            caption: req.body[`mediaCaption_${index}`] || "",
            verified: false,
          });
        }
      });
    }

    // Update validation score
    report.updateValidationScore();

    await report.save();

    res.json({
      success: true,
      message: "Report updated successfully",
      data: {
        report: await report.populate("reporter", "firstName lastName avatar"),
      },
    });
  } catch (error) {
    console.error("Update report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while updating report",
    });
  }
});

// @route   DELETE /api/reports/:id
// @desc    Delete a report
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Check if user can delete this report
    if (!report.canBeDeletedBy(req.user.id, req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to delete this report",
      });
    }

    await report.deleteOne();

    res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("Delete report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting report",
    });
  }
});

// @route   POST /api/reports/:id/validate
// @desc    Validate a report (NGO/Government users)
// @access  Private
router.post(
  "/:id/validate",
  [
    auth,
    authorize("ngo_admin", "government_officer"),
    hasPermission("validate_report"),
    body("status")
      .isIn(["validated", "rejected", "escalated"])
      .withMessage("Invalid status"),
    body("reviewNotes")
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage("Review notes must be between 10 and 1000 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { status, reviewNotes } = req.body;

      const report = await Report.findById(req.params.id).populate(
        "reporter",
        "firstName lastName email phone"
      );

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      const previousStatus = report.status;

      // Update report status
      report.status = status;
      report.reviewedBy = req.user.id;
      report.reviewNotes = reviewNotes;
      report.reviewDate = new Date();

      if (status === "escalated") {
        report.escalatedTo =
          req.user.role === "government_officer" ? "government" : "ngo";
        report.escalationDate = new Date();
        report.escalationNotes = reviewNotes;
      }

      await report.save();

      // Send notification to reporter
      try {
        await sendEmail({
          to: report.reporter.email,
          template: "reportStatusUpdate",
          data: {
            firstName: report.reporter.firstName,
            incidentTitle: report.title,
            previousStatus,
            newStatus: status,
            updatedBy: `${req.user.firstName} ${req.user.lastName}`,
            updateDate: new Date().toLocaleString(),
            notes: reviewNotes,
          },
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
      }

      try {
        await sendSMS({
          to: report.reporter.phone,
          template: "reportStatusUpdate",
          data: {
            firstName: report.reporter.firstName,
            incidentTitle: report.title,
            previousStatus,
            newStatus: status,
            updatedBy: `${req.user.firstName} ${req.user.lastName}`,
            updateDate: new Date().toLocaleString(),
            notes: reviewNotes,
          },
        });
      } catch (smsError) {
        console.error("SMS sending failed:", smsError);
      }

      res.json({
        success: true,
        message: `Report ${status} successfully`,
        data: {
          report: await report.populate(
            "reporter",
            "firstName lastName avatar"
          ),
        },
      });
    } catch (error) {
      console.error("Validate report error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while validating report",
      });
    }
  }
);

// @route   POST /api/reports/:id/like
// @desc    Like/unlike a report
// @access  Private
router.post("/:id/like", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const existingLike = report.likes.find(
      (like) => like.user.toString() === req.user.id
    );

    if (existingLike) {
      // Unlike
      report.likes = report.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
    } else {
      // Like
      report.likes.push({
        user: req.user.id,
        likedAt: new Date(),
      });
    }

    await report.save();

    res.json({
      success: true,
      message: existingLike ? "Report unliked" : "Report liked",
      data: {
        totalLikes: report.likes.length,
        isLiked: !existingLike,
      },
    });
  } catch (error) {
    console.error("Like report error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing like",
    });
  }
});

// @route   POST /api/reports/:id/comment
// @desc    Add a comment to a report
// @access  Private
router.post(
  "/:id/comment",
  [
    auth,
    body("comment")
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage("Comment must be between 1 and 500 characters"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array(),
        });
      }

      const { comment } = req.body;

      const report = await Report.findById(req.params.id);

      if (!report) {
        return res.status(404).json({
          success: false,
          message: "Report not found",
        });
      }

      report.comments.push({
        user: req.user.id,
        comment,
        commentedAt: new Date(),
      });

      await report.save();

      const populatedReport = await Report.findById(req.params.id).populate(
        "comments.user",
        "firstName lastName avatar"
      );

      const newComment =
        populatedReport.comments[populatedReport.comments.length - 1];

      res.json({
        success: true,
        message: "Comment added successfully",
        data: { comment: newComment },
      });
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({
        success: false,
        message: "Server error while adding comment",
      });
    }
  }
);

module.exports = router;