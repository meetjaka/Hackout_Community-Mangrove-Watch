const express = require('express');
const User = require('../models/User');
const Report = require('../models/Report');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/gamification/leaderboard
// @desc    Get leaderboard by region/community
// @access  Private
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { region, limit = 20, period = 'all' } = req.query;
    
    let filter = { isActive: true };
    
    // Filter by region if specified
    if (region) {
      filter['location.address.state'] = region;
    }
    
    // Filter by time period
    if (period !== 'all') {
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      // Get users who have been active in this period
      const activeUserIds = await Report.distinct('reporter', {
        createdAt: { $gte: startDate }
      });
      
      filter._id = { $in: activeUserIds };
    }
    
    const leaderboard = await User.find(filter)
      .sort({ points: -1, level: -1 })
      .limit(parseInt(limit))
      .select('firstName lastName avatar points level badges organization location');
    
    // Add rank to each user
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));
    
    res.json({
      success: true,
      data: {
        leaderboard: rankedLeaderboard,
        period,
        region: region || 'Global'
      }
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching leaderboard'
    });
  }
});

// @route   GET /api/gamification/badges
// @desc    Get available badges and user progress
// @access  Private
router.get('/badges', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Define available badges
    const availableBadges = [
      {
        id: 'first_report',
        name: 'First Report',
        description: 'Submit your first incident report',
        icon: '📝',
        points: 10,
        condition: 'Submit 1 report'
      },
      {
        id: 'reporter',
        name: 'Active Reporter',
        description: 'Submit 10 incident reports',
        icon: '📊',
        points: 50,
        condition: 'Submit 10 reports'
      },
      {
        id: 'expert_reporter',
        name: 'Expert Reporter',
        description: 'Submit 50 incident reports',
        icon: '🏆',
        points: 200,
        condition: 'Submit 50 reports'
      },
      {
        id: 'validator',
        name: 'Validator',
        description: 'Have 10 reports validated',
        icon: '✅',
        points: 100,
        condition: 'Have 10 reports validated'
      },
      {
        id: 'community_leader',
        name: 'Community Leader',
        description: 'Reach 1000 points',
        icon: '👑',
        points: 0,
        condition: 'Reach 1000 points'
      },
      {
        id: 'quick_response',
        name: 'Quick Response',
        description: 'Submit a report within 1 hour of incident',
        icon: '⚡',
        points: 25,
        condition: 'Submit report within 1 hour'
      },
      {
        id: 'photo_evidence',
        name: 'Photo Evidence',
        description: 'Submit a report with 5+ photos',
        icon: '📸',
        points: 30,
        condition: 'Submit report with 5+ photos'
      },
      {
        id: 'location_expert',
        name: 'Location Expert',
        description: 'Submit reports from 5 different locations',
        icon: '🗺️',
        points: 75,
        condition: 'Submit from 5 different locations'
      }
    ];
    
    // Check which badges user has earned
    const userBadges = user.badges || [];
    const earnedBadgeIds = userBadges.map(badge => badge.name);
    
    // Add earned status and progress to badges
    const badgesWithProgress = availableBadges.map(badge => {
      const isEarned = earnedBadgeIds.includes(badge.id);
      let progress = 0;
      let current = 0;
      let target = 0;
      
      // Calculate progress based on badge type
      switch (badge.id) {
        case 'first_report':
          target = 1;
          current = Math.min(user.reportsCount || 0, 1);
          break;
        case 'reporter':
          target = 10;
          current = Math.min(user.reportsCount || 0, 10);
          break;
        case 'expert_reporter':
          target = 50;
          current = Math.min(user.reportsCount || 0, 50);
          break;
        case 'validator':
          target = 10;
          current = Math.min(user.validatedReportsCount || 0, 10);
          break;
        case 'community_leader':
          target = 1000;
          current = Math.min(user.points, 1000);
          break;
        case 'quick_response':
          target = 1;
          current = user.quickResponseCount || 0;
          break;
        case 'photo_evidence':
          target = 1;
          current = user.photoEvidenceCount || 0;
          break;
        case 'location_expert':
          target = 5;
          current = user.uniqueLocationsCount || 0;
          break;
      }
      
      progress = target > 0 ? Math.min((current / target) * 100, 100) : 0;
      
      return {
        ...badge,
        isEarned,
        progress: Math.round(progress),
        current,
        target,
        earnedAt: isEarned ? userBadges.find(b => b.name === badge.id)?.earnedAt : null
      };
    });
    
    res.json({
      success: true,
      data: {
        badges: badgesWithProgress,
        totalEarned: userBadges.length,
        totalAvailable: availableBadges.length
      }
    });
    
  } catch (error) {
    console.error('Badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching badges'
    });
  }
});

// @route   GET /api/gamification/profile
// @desc    Get user's gamification profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Calculate level based on points
    const calculateLevel = (points) => {
      if (points < 100) return 1;
      if (points < 300) return 2;
      if (points < 600) return 3;
      if (points < 1000) return 4;
      if (points < 1500) return 5;
      if (points < 2100) return 6;
      if (points < 2800) return 7;
      if (points < 3600) return 8;
      if (points < 4500) return 9;
      return 10;
    };
    
    const currentLevel = calculateLevel(user.points);
    const nextLevel = currentLevel + 1;
    const pointsForCurrentLevel = currentLevel === 1 ? 0 : Math.pow(currentLevel - 1, 2) * 100;
    const pointsForNextLevel = Math.pow(nextLevel, 2) * 100;
    const progressToNextLevel = pointsForNextLevel > pointsForCurrentLevel 
      ? ((user.points - pointsForCurrentLevel) / (pointsForNextLevel - pointsForCurrentLevel)) * 100
      : 100;
    
    // Get user's report statistics
    const reportsCount = await Report.countDocuments({ reporter: user.id });
    const validatedReportsCount = await Report.countDocuments({ 
      reporter: user.id, 
      status: 'validated' 
    });
    
    // Get user's recent activity
    const recentReports = await Report.find({ reporter: user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title category status createdAt');
    
    // Get user's achievements
    const achievements = user.badges.map(badge => ({
      name: badge.name,
      description: badge.description,
      earnedAt: badge.earnedAt,
      icon: '🏅'
    }));
    
    res.json({
      success: true,
      data: {
        profile: {
          currentLevel,
          nextLevel,
          points: user.points,
          pointsForCurrentLevel,
          pointsForNextLevel,
          progressToNextLevel: Math.round(progressToNextLevel),
          totalBadges: user.badges.length
        },
        statistics: {
          totalReports: reportsCount,
          validatedReports: validatedReportsCount,
          validationRate: reportsCount > 0 ? Math.round((validatedReportsCount / reportsCount) * 100) : 0,
          totalPoints: user.points,
          rank: 'Calculating...' // Would need to calculate global rank
        },
        recentActivity: recentReports,
        achievements
      }
    });
    
  } catch (error) {
    console.error('Gamification profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching gamification profile'
    });
  }
});

// @route   POST /api/gamification/award-points
// @desc    Award points to user (internal use)
// @access  Private (Admin only)
router.post('/award-points', auth, async (req, res) => {
  try {
    const { userId, points, reason } = req.body;
    
    // Check if user has permission to award points
    if (!['super_admin', 'ngo_admin'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to award points'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Award points
    user.points += points;
    
    // Check for level up
    const oldLevel = user.level;
    const newLevel = Math.floor(Math.sqrt(user.points / 100)) + 1;
    user.level = newLevel;
    
    // Add points history (if you want to track)
    if (!user.pointsHistory) user.pointsHistory = [];
    user.pointsHistory.push({
      points,
      reason,
      awardedBy: req.user.id,
      awardedAt: new Date()
    });
    
    await user.save();
    
    res.json({
      success: true,
      message: `Awarded ${points} points to ${user.firstName} ${user.lastName}`,
      data: {
        userId: user.id,
        newPoints: user.points,
        oldLevel,
        newLevel,
        levelUp: newLevel > oldLevel
      }
    });
    
  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while awarding points'
    });
  }
});

// @route   GET /api/gamification/achievements
// @desc    Get user's achievements and progress
// @access  Private
router.get('/achievements', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Get user's reports for achievement calculations
    const userReports = await Report.find({ reporter: user.id });
    
    // Calculate achievements
    const achievements = [
      {
        id: 'total_reports',
        name: 'Report Master',
        description: 'Submit reports in all categories',
        icon: '📋',
        progress: calculateCategoryProgress(userReports),
        maxProgress: 6, // Number of categories
        reward: 'Special badge and 100 points'
      },
      {
        id: 'photo_quality',
        name: 'Photo Journalist',
        description: 'Submit reports with high-quality photos',
        icon: '📸',
        progress: calculatePhotoQualityProgress(userReports),
        maxProgress: 10,
        reward: 'Photo expert badge and 75 points'
      },
      {
        id: 'response_time',
        name: 'Quick Responder',
        description: 'Submit reports within 2 hours of incident',
        icon: '⚡',
        progress: calculateResponseTimeProgress(userReports),
        maxProgress: 20,
        reward: 'Speed demon badge and 50 points'
      },
      {
        id: 'location_coverage',
        name: 'Area Guardian',
        description: 'Submit reports from multiple locations',
        icon: '🗺️',
        progress: calculateLocationCoverageProgress(userReports),
        maxProgress: 10,
        reward: 'Territory master badge and 100 points'
      }
    ];
    
    res.json({
      success: true,
      data: {
        achievements,
        totalCompleted: achievements.filter(a => a.progress >= a.maxProgress).length,
        totalAvailable: achievements.length
      }
    });
    
  } catch (error) {
    console.error('Achievements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching achievements'
    });
  }
});

// Helper functions for achievement calculations
const calculateCategoryProgress = (reports) => {
  const categories = new Set(reports.map(r => r.category));
  return categories.size;
};

const calculatePhotoQualityProgress = (reports) => {
  return reports.filter(r => r.photos && r.photos.length >= 3).length;
};

const calculateResponseTimeProgress = (reports) => {
  const now = new Date();
  return reports.filter(r => {
    const timeDiff = now - new Date(r.incidentDate);
    return timeDiff <= 2 * 60 * 60 * 1000; // 2 hours
  }).length;
};

const calculateLocationCoverageProgress = (reports) => {
  const locations = new Set();
  reports.forEach(r => {
    if (r.location && r.location.coordinates) {
      const key = `${Math.round(r.location.coordinates[0] * 100) / 100},${Math.round(r.location.coordinates[1] * 100) / 100}`;
      locations.add(key);
    }
  });
  return locations.size;
};

module.exports = router;
