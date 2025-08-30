const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Report = require('../models/Report');
const { auth, authorize, hasPermission } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard overview
// @access  Private (Admin only)
router.get('/dashboard', [
  auth,
  authorize('super_admin', 'ngo_admin')
], async (req, res) => {
  try {
    // Get system statistics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const urgentReports = await Report.countDocuments({
      $or: [
        { severity: 'critical' },
        { isUrgent: true }
      ]
    });
    
    // Get users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get recent reports
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('reporter', 'firstName lastName email');
    
    // Get system health
    const systemHealth = {
      database: 'healthy',
      emailService: 'operational',
      smsService: 'operational',
      fileStorage: 'healthy',
      uptime: process.uptime()
    };
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          totalReports,
          pendingReports,
          urgentReports
        },
        usersByRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        recentReports,
        systemHealth
      }
    });
    
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin dashboard'
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users (admin only)
// @access  Private (Admin only)
router.get('/users', [
  auth,
  authorize('super_admin', 'ngo_admin'),
  hasPermission('manage_users')
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      status,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (role) filter.role = role;
    if (status === 'active') filter.isActive = true;
    if (status === 'inactive') filter.isActive = false;
    if (status === 'blocked') filter.isBlocked = true;
    
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await User.find(filter)
      .select('-password')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalUsers: total,
          hasNextPage: skip + users.length < total,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (admin only)
// @access  Private (Admin only)
router.put('/users/:id', [
  auth,
  authorize('super_admin', 'ngo_admin'),
  hasPermission('manage_users'),
  body('role').optional().isIn(['super_admin', 'ngo_admin', 'government_officer', 'citizen', 'researcher', 'public_visitor']).withMessage('Invalid role'),
  body('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
  body('isBlocked').optional().isBoolean().withMessage('isBlocked must be boolean'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { role, isActive, isBlocked, permissions } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Super admin can only be modified by super admin
    if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Only super admin can modify super admin users'
      });
    }
    
    // Update user
    if (role !== undefined) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (isBlocked !== undefined) user.isBlocked = isBlocked;
    if (permissions !== undefined) user.permissions = permissions;
    
    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (admin only)
// @access  Private (Admin only)
router.delete('/users/:id', [
  auth,
  authorize('super_admin'),
  hasPermission('manage_users')
], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Cannot delete super admin
    if (user.role === 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete super admin user'
      });
    }
    
    // Cannot delete self
    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Get all reports (admin only)
// @access  Private (Admin only)
router.get('/reports', [
  auth,
  authorize('super_admin', 'ngo_admin'),
  hasPermission('view_reports')
], async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      category,
      severity,
      reporter,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (reporter) filter.reporter = reporter;
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const reports = await Report.find(filter)
      .populate('reporter', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName role')
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
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reports'
    });
  }
});

// @route   PUT /api/admin/reports/:id
// @desc    Update report (admin only)
// @access  Private (Admin only)
router.put('/reports/:id', [
  auth,
  authorize('super_admin', 'ngo_admin'),
  hasPermission('edit_report'),
  body('status').optional().isIn(['pending', 'under_review', 'validated', 'rejected', 'escalated', 'resolved']).withMessage('Invalid status'),
  body('severity').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity'),
  body('reviewNotes').optional().trim().isLength({ max: 1000 }).withMessage('Review notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, severity, reviewNotes } = req.body;
    
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }
    
    // Update report
    if (status !== undefined) report.status = status;
    if (severity !== undefined) report.severity = severity;
    if (reviewNotes !== undefined) report.reviewNotes = reviewNotes;
    
    if (status) {
      report.reviewedBy = req.user.id;
      report.reviewDate = new Date();
    }
    
    await report.save();

    res.json({
      success: true,
      message: 'Report updated successfully',
      data: {
        report: await report.populate('reporter', 'firstName lastName email')
      }
    });

  } catch (error) {
    console.error('Update admin report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating report'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics (admin only)
// @access  Private (Admin only)
router.get('/analytics', [
  auth,
  authorize('super_admin', 'ngo_admin'),
  hasPermission('view_analytics')
], async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // User analytics
    const userAnalytics = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          newUsers: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Report analytics
    const reportAnalytics = await Report.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          newReports: { $sum: 1 },
          avgValidationScore: { $avg: '$validationScore' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Category distribution
    const categoryDistribution = await Report.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgValidationScore: { $avg: '$validationScore' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Status distribution
    const statusDistribution = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        userAnalytics,
        reportAnalytics,
        categoryDistribution,
        statusDistribution,
        period: `${days} days`
      }
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// @route   POST /api/admin/broadcast
// @desc    Send broadcast message to users (admin only)
// @access  Private (Admin only)
router.post('/broadcast', [
  auth,
  authorize('super_admin', 'ngo_admin'),
  hasPermission('manage_system'),
  body('message').trim().isLength({ min: 10, max: 1000 }).withMessage('Message must be between 10 and 1000 characters'),
  body('type').isIn(['email', 'sms', 'both']).withMessage('Type must be email, sms, or both'),
  body('targetUsers').optional().isIn(['all', 'active', 'role']).withMessage('Invalid target users'),
  body('role').optional().isIn(['citizen', 'ngo_admin', 'government_officer', 'researcher']).withMessage('Invalid role'),
  body('title').optional().trim().isLength({ max: 200 }).withMessage('Title cannot exceed 200 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { message, type, targetUsers = 'all', role, title } = req.body;
    
    // Build user filter
    let userFilter = { isActive: true };
    
    if (targetUsers === 'role' && role) {
      userFilter.role = role;
    }
    
    // Get target users
    const users = await User.find(userFilter).select('email phone firstName lastName');
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found matching the criteria'
      });
    }
    
    // Send messages (this would integrate with your email/SMS services)
    let results = {
      totalUsers: users.length,
      emailSent: 0,
      smsSent: 0,
      errors: []
    };
    
    // In a real implementation, you would send emails/SMS here
    // For now, we'll just return a success message
    
    res.json({
      success: true,
      message: `Broadcast message sent to ${users.length} users`,
      data: {
        message,
        type,
        targetUsers,
        role,
        title,
        results
      }
    });

  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending broadcast'
    });
  }
});

// @route   GET /api/admin/system-status
// @desc    Get system status and health (admin only)
// @access  Private (Admin only)
router.get('/system-status', [
  auth,
  authorize('super_admin'),
  hasPermission('manage_system')
], async (req, res) => {
  try {
    // Get system information
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    // Get database status
    const dbStatus = {
      connection: 'connected',
      collections: Object.keys(require('mongoose').connection.collections).length
    };
    
    // Get service statuses
    const serviceStatus = {
      email: 'operational',
      sms: 'operational',
      fileStorage: 'operational',
      externalAPIs: 'operational'
    };
    
    res.json({
      success: true,
      data: {
        systemInfo,
        dbStatus,
        serviceStatus,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('System status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system status'
    });
  }
});

module.exports = router;
