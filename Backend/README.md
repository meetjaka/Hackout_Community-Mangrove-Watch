# Community Mangrove Watch - Backend API

A comprehensive backend API for the Community Mangrove Watch platform, built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Management**: Multi-role authentication system with JWT tokens
- **Incident Reporting**: Complete CRUD operations for mangrove incident reports
- **File Uploads**: Support for photos and videos with validation
- **Gamification**: Points, badges, and leaderboard system
- **Dashboard & Analytics**: Comprehensive data visualization and reporting
- **Community Features**: Forums, events, and resource management
- **Admin Panel**: Full administrative controls and user management
- **Email & SMS**: Automated notifications and alerts
- **Role-Based Access Control**: Granular permissions system

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcrypt
- **File Upload**: Multer
- **Validation**: Express-validator
- **Email**: Nodemailer
- **SMS**: Twilio
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mangrove_watch
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=7d
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Start MongoDB**
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📁 Project Structure

```
backend/
├── models/              # Database models
│   ├── User.js         # User model with roles and permissions
│   └── Report.js       # Incident report model
├── routes/              # API route handlers
│   ├── auth.js         # Authentication routes
│   ├── users.js        # User management routes
│   ├── reports.js      # Incident reporting routes
│   ├── dashboard.js    # Dashboard and analytics routes
│   ├── gamification.js # Gamification system routes
│   ├── community.js    # Community features routes
│   └── admin.js        # Administrative routes
├── middleware/          # Custom middleware
│   └── auth.js         # Authentication and authorization middleware
├── utils/               # Utility functions
│   ├── email.js        # Email service utilities
│   └── sms.js          # SMS service utilities
├── uploads/             # File upload directory
├── server.js            # Main application file
├── package.json         # Dependencies and scripts
└── README.md            # This file
```

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/password` - Change password
- `GET /api/users/reports` - Get user's reports
- `GET /api/users/statistics` - Get user statistics
- `GET /api/users/:id` - Get public user profile
- `GET /api/users/:id/reports` - Get user's public reports

### Reports
- `POST /api/reports` - Create new incident report
- `GET /api/reports` - Get all reports (with filtering)
- `GET /api/reports/:id` - Get specific report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `POST /api/reports/:id/validate` - Validate report (admin)
- `POST /api/reports/:id/like` - Like/unlike report
- `POST /api/reports/:id/comment` - Add comment to report

### Dashboard
- `GET /api/dashboard/overview` - Dashboard overview
- `GET /api/dashboard/analytics` - Detailed analytics
- `GET /api/dashboard/heatmap` - Incident heatmap data
- `GET /api/dashboard/trends` - Trend analysis
- `GET /api/dashboard/export` - Export data

### Gamification
- `GET /api/gamification/leaderboard` - User leaderboard
- `GET /api/gamification/badges` - Available badges
- `GET /api/gamification/profile` - User gamification profile
- `GET /api/gamification/achievements` - User achievements
- `POST /api/gamification/award-points` - Award points (admin)

### Community
- `GET /api/community/overview` - Community overview
- `GET /api/community/resources` - Educational resources
- `GET /api/community/events` - Community events
- `POST /api/community/events/:id/register` - Register for event
- `GET /api/community/forums` - Discussion forums
- `GET /api/community/forums/:id/topics` - Forum topics
- `GET /api/community/partners` - Community partners

### Admin
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/admin/users` - Manage users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/reports` - Manage reports
- `PUT /api/admin/reports/:id` - Update report
- `GET /api/admin/analytics` - Admin analytics
- `POST /api/admin/broadcast` - Send broadcast messages
- `GET /api/admin/system-status` - System health

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive request validation
- **CORS Protection**: Cross-origin resource sharing control
- **Helmet**: Security headers middleware
- **Role-Based Access**: Granular permission system

## 📊 Database Models

### User Model
- Basic information (name, email, phone)
- Role-based permissions
- Location and organization details
- Gamification data (points, badges, level)
- Authentication and security fields

### Report Model
- Incident details and categorization
- Geographic location with coordinates
- Media attachments (photos/videos)
- Validation and review status
- Engagement metrics (likes, comments)

## 🎮 Gamification System

- **Points System**: Earn points for various activities
- **Badges**: Unlock achievements and recognition
- **Leaderboards**: Regional and global rankings
- **Levels**: Progressive user advancement
- **Rewards**: Incentives for participation

## 📧 Notification System

- **Email Notifications**: Welcome, password reset, report updates
- **SMS Alerts**: Urgent notifications and alerts
- **Push Notifications**: Real-time updates (future implementation)

## 🚀 Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment variables
2. Configure production MongoDB connection
3. Set up proper SSL certificates
4. Configure reverse proxy (nginx/Apache)
5. Set up process manager (PM2)

### Environment Variables
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mangrove_watch
JWT_SECRET=very_secure_jwt_secret
JWT_EXPIRE=7d
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📝 API Documentation

For detailed API documentation, visit:
- **Swagger UI**: `/api-docs` (when implemented)
- **Postman Collection**: Available in `/docs` folder

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- Complete user management system
- Incident reporting functionality
- Gamification system
- Admin panel
- Community features
- Dashboard and analytics
- Email and SMS notifications

---

**Community Mangrove Watch** - Protecting mangrove ecosystems through community participation and technology.
