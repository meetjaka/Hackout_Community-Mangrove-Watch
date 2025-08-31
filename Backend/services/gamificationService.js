const { Achievement, UserAchievement, PointLog } = require('../models/Gamification');
const User = require('../models/User');

class GamificationService {
  // Point values for different actions
  static POINT_VALUES = {
    SUBMIT_REPORT: 10,
    VERIFIED_REPORT: 20,
    COMMENT: 2,
    VERIFY_REPORT: 5,
    FIRST_REPORT: 50,
    MONTHLY_TOP_REPORTER: 100,
  };

  // Award points to a user
  async awardPoints(userId, action, points, reference = null, referenceModel = null) {
    try {
      // Create point log
      const pointLog = await PointLog.create({
        user: userId,
        action,
        points,
        reference,
        referenceModel
      });

      // Update user's total points
      await User.findByIdAndUpdate(userId, {
        $inc: { points: points }
      });

      // Check for achievements
      await this.checkAchievements(userId);

      return pointLog;
    } catch (error) {
      console.error('Error awarding points:', error);
      throw error;
    }
  }

  // Check and award achievements
  async checkAchievements(userId) {
    try {
      const user = await User.findById(userId);
      const achievements = await Achievement.find();

      for (const achievement of achievements) {
        await this.checkSingleAchievement(user, achievement);
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
      throw error;
    }
  }

  // Check if a user qualifies for a specific achievement
  async checkSingleAchievement(user, achievement) {
    try {
      // Check if user already has this achievement
      const existingAchievement = await UserAchievement.findOne({
        user: user._id,
        achievement: achievement._id
      });

      if (existingAchievement) {
        return false;
      }

      // Check if user meets criteria
      const qualifies = await this.checkAchievementCriteria(user, achievement);

      if (qualifies) {
        // Award achievement
        await UserAchievement.create({
          user: user._id,
          achievement: achievement._id
        });

        // Award achievement points
        await this.awardPoints(
          user._id,
          `ACHIEVEMENT_${achievement.name}`,
          achievement.points
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error checking single achievement:', error);
      throw error;
    }
  }

  // Check if user meets achievement criteria
  async checkAchievementCriteria(user, achievement) {
    const criteria = achievement.criteria;
    
    switch (achievement.category) {
      case 'REPORTING':
        return this.checkReportingAchievement(user, criteria);
      case 'VERIFICATION':
        return this.checkVerificationAchievement(user, criteria);
      case 'COMMUNITY':
        return this.checkCommunityAchievement(user, criteria);
      default:
        return false;
    }
  }

  // Get user's current level
  async getUserLevel(userId) {
    const user = await User.findById(userId);
    return this.calculateLevel(user.points);
  }

  // Calculate level based on points
  calculateLevel(points) {
    // Example level calculation: level = floor(sqrt(points/100)) + 1
    return Math.floor(Math.sqrt(points / 100)) + 1;
  }

  // Get leaderboard
  async getLeaderboard(timeframe = 'all', limit = 10) {
    let query = {};
    
    if (timeframe !== 'all') {
      const date = new Date();
      if (timeframe === 'monthly') {
        date.setMonth(date.getMonth() - 1);
      } else if (timeframe === 'weekly') {
        date.setDate(date.getDate() - 7);
      }
      
      query.createdAt = { $gte: date };
    }

    const leaders = await PointLog.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$user',
          points: { $sum: '$points' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          points: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.avatar': 1
        }
      },
      { $sort: { points: -1 } },
      { $limit: limit }
    ]);

    return leaders;
  }

  // Get user achievements
  async getUserAchievements(userId) {
    return UserAchievement.find({ user: userId })
      .populate('achievement')
      .sort({ earnedAt: -1 });
  }

  // Get user point history
  async getUserPointHistory(userId) {
    return PointLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('reference');
  }
}

module.exports = new GamificationService();
