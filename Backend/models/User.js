const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  // Authentication
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Role and Permissions
  role: {
    type: String,
    enum: [
      'super_admin',
      'ngo_admin',
      'government_officer',
      'researcher',
      'fisherman',
      'coastal_resident',
      'citizen_scientist',
      'local_guide',
      'public_visitor'
    ],
    default: 'coastal_resident'
  },

  permissions: [{
    type: String,
    enum: [
      'create_report', 'edit_report', 'delete_report', 'view_reports',
      'validate_report', 'escalate_report', 'view_dashboard', 'manage_users',
      'manage_content', 'export_data', 'view_analytics', 'manage_system'
    ]
  }],
  
  // Profile Information
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
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
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Organization Details (for NGO and Government users)
  organization: {
    name: String,
    type: {
      type: String,
      enum: ['ngo', 'government', 'research_institute', 'other']
    },
    position: String,
    website: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Role-specific additional information
  roleSpecificInfo: {
    type: mongoose.Schema.Types.Mixed,  // Flexible schema for role-specific data
    default: {}
  },
  
  // Verification and Status
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  
  // Gamification
  points: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  badges: [{
    name: String,
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Preferences
  language: {
    type: String,
    enum: ['en', 'hi', 'gu'],
    default: 'en'
  },
  notifications: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  },
  
  // Social Login
  socialLogin: {
    google: {
      id: String,
      email: String
    },
    facebook: {
      id: String,
      email: String
    }
  },
  
  // Timestamps
  lastLogin: Date,
  lastActivity: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ location: '2dsphere' });
userSchema.index({ points: -1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update passwordChangedAt
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      email: this.email 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

userSchema.methods.hasPermission = function(permission) {
  return this.permissions.includes(permission) || this.role === 'super_admin';
};

userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    bio: this.bio,
    location: this.location,
    points: this.points,
    level: this.level,
    badges: this.badges,
    organization: this.organization,
    createdAt: this.createdAt
  };
};

// Static methods
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true });
};

userSchema.statics.findTopContributors = function(limit = 10) {
  return this.find({ isActive: true })
    .sort({ points: -1 })
    .limit(limit)
    .select('firstName lastName avatar points level badges');
};

module.exports = mongoose.model('User', userSchema);
