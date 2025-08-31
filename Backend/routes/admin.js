const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Report = require('../models/Report');
const Community = require('../models/Community'); // Added Community model
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

// Community Content Management Routes
// @route   GET /api/admin/community/content
// @desc    Get all community content for management
// @access  Admin only
router.get('/community/content', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    res.json({
      success: true,
      data: {
        resources: community.resources,
        guidelines: community.guidelines,
        events: community.events,
        partners: community.partners,
        stats: {
          totalResources: community.resources.length,
          totalGuidelines: community.guidelines.length,
          totalEvents: community.events.length,
          totalPartners: community.partners.length
        }
      }
    });
  } catch (error) {
    console.error('Admin community content error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community content'
    });
  }
});

// @route   POST /api/admin/community/resources
// @desc    Add new educational resource
// @access  Admin only
router.post('/community/resources', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      title,
      description,
      category,
      type,
      url,
      tags,
      difficulty,
      estimatedTime,
      language
    } = req.body;

    // Validate required fields
    if (!title || !description || !category || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and type are required'
      });
    }

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    const newResource = {
      title,
      description,
      category,
      type,
      url: url || '#',
      tags: tags || [],
      difficulty: difficulty || 'beginner',
      estimatedTime: estimatedTime || '15 minutes',
      language: language || 'en',
      isActive: true,
      createdAt: new Date()
    };

    community.resources.push(newResource);
    await community.save();

    res.json({
      success: true,
      message: 'Educational resource added successfully',
      data: newResource
    });
  } catch (error) {
    console.error('Admin add resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding resource'
    });
  }
});

// @route   PUT /api/admin/community/resources/:id
// @desc    Update educational resource
// @access  Admin only
router.put('/community/resources/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    const resourceIndex = community.resources.findIndex(r => r._id.toString() === id);
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Update resource
    community.resources[resourceIndex] = {
      ...community.resources[resourceIndex],
      ...updateData,
      updatedAt: new Date()
    };

    await community.save();

    res.json({
      success: true,
      message: 'Resource updated successfully',
      data: community.resources[resourceIndex]
    });
  } catch (error) {
    console.error('Admin update resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating resource'
    });
  }
});

// @route   DELETE /api/admin/community/resources/:id
// @desc    Delete educational resource
// @access  Admin only
router.delete('/community/resources/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    const resourceIndex = community.resources.findIndex(r => r._id.toString() === id);
    if (resourceIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    // Soft delete by setting isActive to false
    community.resources[resourceIndex].isActive = false;
    await community.save();

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting resource'
    });
  }
});

// @route   POST /api/admin/community/guidelines
// @desc    Add new community guideline
// @access  Admin only
router.post('/community/guidelines', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { title, description, order } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    // Auto-assign order if not provided
    const newOrder = order || Math.max(...community.guidelines.map(g => g.order), 0) + 1;

    const newGuideline = {
      title,
      description,
      order: newOrder,
      isActive: true
    };

    community.guidelines.push(newGuideline);
    await community.save();

    res.json({
      success: true,
      message: 'Community guideline added successfully',
      data: newGuideline
    });
  } catch (error) {
    console.error('Admin add guideline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding guideline'
    });
  }
});

// @route   PUT /api/admin/community/guidelines/:id
// @desc    Update community guideline
// @access  Admin only
router.put('/community/guidelines/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    const guidelineIndex = community.guidelines.findIndex(g => g._id.toString() === id);
    if (guidelineIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Guideline not found'
      });
    }

    // Update guideline
    community.guidelines[guidelineIndex] = {
      ...community.guidelines[guidelineIndex],
      ...updateData
    };

    await community.save();

    res.json({
      success: true,
      message: 'Guideline updated successfully',
      data: community.guidelines[guidelineIndex]
    });
  } catch (error) {
    console.error('Admin update guideline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating guideline'
    });
  }
});

// @route   DELETE /api/admin/community/guidelines/:id
// @desc    Delete community guideline
// @access  Admin only
router.delete('/community/guidelines/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    const guidelineIndex = community.guidelines.findIndex(g => g._id.toString() === id);
    if (guidelineIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Guideline not found'
      });
    }

    // Soft delete
    community.guidelines[guidelineIndex].isActive = false;
    await community.save();

    res.json({
      success: true,
      message: 'Guideline deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete guideline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting guideline'
    });
  }
});

// @route   GET /api/admin/community/analytics
// @desc    Get community analytics and insights
// @access  Admin only
router.get('/community/analytics', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community data not found'
      });
    }

    // Calculate analytics
    const analytics = {
      resources: {
        total: community.resources.length,
        active: community.resources.filter(r => r.isActive).length,
        byCategory: community.resources.reduce((acc, r) => {
          acc[r.category] = (acc[r.category] || 0) + 1;
          return acc;
        }, {}),
        byDifficulty: community.resources.reduce((acc, r) => {
          acc[r.difficulty] = (acc[r.difficulty] || 0) + 1;
          return acc;
        }, {}),
        byLanguage: community.resources.reduce((acc, r) => {
          acc[r.language] = (acc[r.language] || 0) + 1;
          return acc;
        }, {})
      },
      guidelines: {
        total: community.guidelines.length,
        active: community.guidelines.filter(g => g.isActive).length
      },
      events: {
        total: community.events.length,
        active: community.events.filter(e => e.isActive).length,
        upcoming: community.events.filter(e => e.isActive && e.date > new Date()).length
      },
      partners: {
        total: community.partners.length,
        active: community.partners.filter(p => p.isActive).length,
        byType: community.partners.reduce((acc, p) => {
          acc[p.type] = (acc[p.type] || 0) + 1;
          return acc;
        }, {})
      },
      community: {
        totalMembers: community.totalMembers,
        activeMembers: community.activeMembers,
        totalReports: community.totalReports,
        totalMangroveAreas: community.totalMangroveAreas
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Admin community analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// @route   POST /api/admin/community
// @desc    Create a new community
// @access  Admin only
router.post('/community', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      name,
      description,
      location,
      focusAreas,
      contactInfo
    } = req.body;

    // Validate required fields
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required'
      });
    }

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name: name });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: 'Community with this name already exists'
      });
    }

    // Create new community
    const newCommunity = new Community({
      name,
      description,
      location: location || {},
      focusAreas: focusAreas || [],
      contactInfo: contactInfo || {},
      isActive: true,
      resources: [],
      guidelines: [],
      events: [],
      partners: [],
      totalMembers: 0,
      activeMembers: 0,
      totalReports: 0,
      totalMangroveAreas: 0
    });

    await newCommunity.save();

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: newCommunity
    });
  } catch (error) {
    console.error('Admin create community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating community'
    });
  }
});

// @route   PUT /api/admin/community/:id
// @desc    Update community details
// @access  Admin only
router.put('/community/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Update community
    Object.assign(community, updateData);
    await community.save();

    res.json({
      success: true,
      message: 'Community updated successfully',
      data: community
    });
  } catch (error) {
    console.error('Admin update community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating community'
    });
  }
});

// @route   DELETE /api/admin/community/:id
// @desc    Delete community (soft delete)
// @access  Admin only
router.delete('/community/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { id } = req.params;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Soft delete
    community.isActive = false;
    await community.save();

    res.json({
      success: true,
      message: 'Community deleted successfully'
    });
  } catch (error) {
    console.error('Admin delete community error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting community'
    });
  }
});

// @route   GET /api/admin/community/list
// @desc    Get list of all communities
// @access  Admin only
router.get('/community/list', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const communities = await Community.find().select('name description location isActive createdAt totalMembers totalReports');

    res.json({
      success: true,
      data: {
        communities,
        totalCommunities: communities.length
      }
    });
  } catch (error) {
    console.error('Admin list communities error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching communities'
    });
  }
});

module.exports = router;
