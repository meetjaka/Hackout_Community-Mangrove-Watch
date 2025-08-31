const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema({
  // Community Information
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  
  // Community Statistics
  totalMembers: {
    type: Number,
    default: 0
  },
  activeMembers: {
    type: Number,
    default: 0
  },
  totalReports: {
    type: Number,
    default: 0
  },
  totalMangroveAreas: {
    type: Number,
    default: 0
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Community Guidelines
  guidelines: [{
    title: String,
    description: String,
    order: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Educational Resources
  resources: [{
    title: String,
    description: String,
    category: {
      type: String,
      enum: ['education', 'guide', 'inspiration', 'legal', 'technical']
    },
    type: {
      type: String,
      enum: ['article', 'tutorial', 'case-study', 'reference', 'video']
    },
    url: String,
    tags: [String],
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'all']
    },
    estimatedTime: String,
    language: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      default: 'en'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Community Events
  events: [{
    title: String,
    description: String,
    date: Date,
    location: String,
    coordinates: [Number],
    organizer: String,
    type: {
      type: String,
      enum: ['cleanup', 'workshop', 'contest', 'meeting', 'other']
    },
    maxParticipants: Number,
    currentParticipants: {
      type: Number,
      default: 0
    },
    difficulty: {
      type: String,
      enum: ['easy', 'moderate', 'hard', 'all']
    },
    registrationRequired: {
      type: Boolean,
      default: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Community Partners
  partners: [{
    name: String,
    type: {
      type: String,
      enum: ['ngo', 'government', 'research_institute', 'private', 'other']
    },
    region: String,
    description: String,
    website: String,
    logo: String,
    focusAreas: [String],
    projects: {
      type: Number,
      default: 0
    },
    members: {
      type: Number,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Community Settings
  settings: {
    allowPublicAccess: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    maxFileSize: {
      type: Number,
      default: 10485760 // 10MB
    },
    allowedFileTypes: [String],
    autoModeration: {
      type: Boolean,
      default: true
    }
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Indexes
communitySchema.index({ location: '2dsphere' });
communitySchema.index({ name: 1 });
communitySchema.index({ 'location.address.state': 1 });
communitySchema.index({ isActive: 1 });

// Virtual for total communities
communitySchema.virtual('totalCommunities').get(function() {
  return this.model('Community').countDocuments({ isActive: true });
});

// Methods
communitySchema.methods.updateStats = async function() {
  try {
    const User = mongoose.model('User');
    const Report = mongoose.model('Report');
    
    // Update member counts
    this.totalMembers = await User.countDocuments({ isActive: true });
    this.activeMembers = await User.countDocuments({ 
      isActive: true, 
      lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Active in last 30 days
    });
    
    // Update report count
    this.totalReports = await Report.countDocuments();
    
    // Update mangrove areas count (unique locations)
    const uniqueLocations = await Report.distinct('location.coordinates');
    this.totalMangroveAreas = uniqueLocations.length;
    
    await this.save();
    return this;
  } catch (error) {
    console.error('Error updating community stats:', error);
    throw error;
  }
};

// Static methods
communitySchema.statics.getOverview = async function() {
  try {
    const User = mongoose.model('User');
    const Report = mongoose.model('Report');
    
    // Get real-time statistics
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalReports = await Report.countDocuments();
    
    // Get active communities (regions with reports)
    const activeRegions = await Report.distinct('location.address.state');
    const activeCommunities = activeRegions.length;
    
    // Get unique mangrove areas
    const uniqueLocations = await Report.distinct('location.coordinates');
    const totalMangroveAreas = uniqueLocations.length;
    
    // Get top contributors
    const topContributors = await User.find({ isActive: true })
      .sort({ points: -1 })
      .limit(10)
      .select('firstName lastName avatar points level badges organization location');
    
    // Get recent activity
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reporter', 'firstName lastName avatar');
    
    return {
      overview: {
        totalUsers,
        totalReports,
        activeCommunities,
        totalMangroveAreas
      },
      topContributors,
      recentActivity: recentReports
    };
  } catch (error) {
    console.error('Error getting community overview:', error);
    throw error;
  }
};

module.exports = mongoose.model('Community', communitySchema);
