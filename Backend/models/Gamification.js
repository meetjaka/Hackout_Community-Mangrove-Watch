const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: String,
  category: {
    type: String,
    enum: ['REPORTING', 'VERIFICATION', 'COMMUNITY', 'SPECIAL']
  },
  points: {
    type: Number,
    default: 0
  },
  icon: String,
  criteria: {
    type: Map,
    of: Number
  },
  level: {
    type: Number,
    default: 1
  }
});

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.ObjectId,
    ref: 'Achievement',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Map,
    of: Number
  }
});

const pointLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  reference: {
    type: mongoose.Schema.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['Report', 'Comment', 'Verification']
  }
}, {
  timestamps: true
});

// Add indexes
userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });
pointLogSchema.index({ user: 1, createdAt: -1 });

const Achievement = mongoose.model('Achievement', achievementSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);
const PointLog = mongoose.model('PointLog', pointLogSchema);

module.exports = {
  Achievement,
  UserAchievement,
  PointLog
};
