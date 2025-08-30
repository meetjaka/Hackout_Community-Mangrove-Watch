const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Reporter Information
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Incident Details
  title: {
    type: String,
    required: [true, 'Report title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Report description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Incident Category and Type
  category: {
    type: String,
    enum: ['illegal_cutting', 'land_reclamation', 'pollution', 'dumping', 'construction', 'other'],
    required: [true, 'Incident category is required']
  },
  subCategory: {
    type: String,
    trim: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Location Information
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'Location coordinates are required']
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    mangroveArea: String,
    nearestLandmark: String
  },
  
  // Media and Evidence
  photos: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],
  videos: [{
    url: String,
    caption: String,
    duration: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Report Status and Validation
  status: {
    type: String,
    enum: ['pending', 'under_review', 'validated', 'rejected', 'escalated', 'resolved'],
    default: 'pending'
  },
  validationScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  aiValidation: {
    isAnomaly: Boolean,
    confidence: Number,
    analysis: String,
    validatedAt: Date
  },
  satelliteValidation: {
    crossChecked: Boolean,
    satelliteImage: String,
    comparisonResult: String,
    validatedAt: Date
  },
  
  // Manual Review
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNotes: String,
  reviewDate: Date,
  
  // Escalation
  escalatedTo: {
    type: String,
    enum: ['government', 'ngo', 'law_enforcement', 'none'],
    default: 'none'
  },
  escalationDate: Date,
  escalationNotes: String,
  
  // Additional Information
  estimatedArea: {
    value: Number,
    unit: {
      type: String,
      enum: ['sq_meters', 'sq_kilometers', 'acres', 'hectares']
    }
  },
  estimatedDamage: {
    value: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    description: String
  },
  environmentalImpact: {
    type: String,
    enum: ['minimal', 'moderate', 'significant', 'severe'],
    default: 'moderate'
  },
  
  // Tags and Keywords
  tags: [String],
  
  // Timestamps
  incidentDate: {
    type: Date,
    required: [true, 'Incident date is required']
  },
  reportedAt: {
    type: Date,
    default: Date.now
  },
  
  // Engagement
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    commentedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Follow-up
  followUpActions: [{
    action: String,
    description: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    takenAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  }],
  
  // Metadata
  source: {
    type: String,
    enum: ['mobile_app', 'sms', 'web', 'api'],
    default: 'mobile_app'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isUrgent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
reportSchema.index({ location: '2dsphere' });
reportSchema.index({ category: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ reporter: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ incidentDate: -1 });
reportSchema.index({ severity: 1 });
reportSchema.index({ 'location.coordinates': '2dsphere' });

// Virtual fields
reportSchema.virtual('totalPhotos').get(function() {
  return this.photos.length;
});

reportSchema.virtual('totalLikes').get(function() {
  return this.likes.length;
});

reportSchema.virtual('totalComments').get(function() {
  return this.comments.length;
});

reportSchema.virtual('isUrgentReport').get(function() {
  return this.severity === 'critical' || this.isUrgent;
});

// Instance methods
reportSchema.methods.updateValidationScore = function() {
  let score = 0;
  
  // Base score for submission
  score += 10;
  
  // Photo evidence
  if (this.photos.length > 0) score += 20;
  if (this.photos.length > 2) score += 10;
  
  // Location accuracy
  if (this.location.coordinates && this.location.coordinates.length === 2) score += 15;
  
  // Description quality
  if (this.description.length > 100) score += 10;
  if (this.description.length > 300) score += 5;
  
  // Additional details
  if (this.estimatedArea) score += 10;
  if (this.tags && this.tags.length > 0) score += 5;
  
  this.validationScore = Math.min(score, 100);
  return this.validationScore;
};

reportSchema.methods.canBeEditedBy = function(userId, userRole) {
  if (userRole === 'super_admin' || userRole === 'ngo_admin') return true;
  return this.reporter.toString() === userId.toString();
};

reportSchema.methods.canBeDeletedBy = function(userId, userRole) {
  if (userRole === 'super_admin') return true;
  if (userRole === 'ngo_admin' && this.status === 'pending') return true;
  return this.reporter.toString() === userId.toString() && this.status === 'pending';
};

// Static methods
reportSchema.statics.findByLocation = function(coordinates, maxDistance = 10000) {
  return this.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: coordinates
        },
        $maxDistance: maxDistance
      }
    }
  });
};

reportSchema.statics.findByCategory = function(category, limit = 50) {
  return this.find({ category })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('reporter', 'firstName lastName avatar');
};

reportSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        totalValidated: { $sum: { $cond: [{ $eq: ['$status', 'validated'] }, 1, 0] } },
        totalPending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
        totalEscalated: { $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] } },
        avgValidationScore: { $avg: '$validationScore' }
      }
    }
  ]);
  
  return stats[0] || {
    totalReports: 0,
    totalValidated: 0,
    totalPending: 0,
    totalEscalated: 0,
    avgValidationScore: 0
  };
};

// Ensure virtual fields are serialized
reportSchema.set('toJSON', { virtuals: true });
reportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', reportSchema);
