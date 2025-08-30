# Community Mangrove Watch - Real Data Setup

This project has been updated to use real data from the backend database instead of mock data. Here's how to set it up and run it.

## 🚀 Quick Start

### 1. Backend Setup

```bash
cd Backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string and other config

# Start MongoDB (if running locally)
mongod

# Seed the database with sample data
node seedData.js

# Start the backend server
npm start
```

### 2. Frontend Setup

```bash
cd Frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your backend API URL

# Start the frontend development server
npm run dev
```

## 📊 Database Schema

The project uses MongoDB with the following main collections:

### Users
- Basic profile information
- Role-based permissions
- Gamification points and badges
- Location data

### Reports
- Incident reports with photos/videos
- Location coordinates
- Status tracking
- Validation scores

### Gamification
- Achievement definitions
- User progress tracking
- Point calculations

## 🔄 Real Data Flow

### Dashboard
- **Statistics**: Real-time counts from database
- **Recent Reports**: Latest reports from Reports collection
- **Activities**: User activity based on actual reports and achievements
- **Events**: Community events from database

### Reports
- **List View**: Paginated reports from database with real-time filtering
- **Search**: Full-text search across report content
- **Status Updates**: Real-time status changes
- **Photo Evidence**: Actual uploaded images

### Leaderboard
- **User Rankings**: Based on actual points earned
- **Achievements**: Real progress tracking
- **Badges**: Earned through actual contributions

### Community
- **Member Stats**: Real user counts and contributions
- **Resources**: Educational content database
- **Events**: Community event management
- **Forums**: Discussion topics and replies

## 🗄️ Database Seeding

The `seedData.js` script creates:

- **3 Sample Users** with different roles and points
- **3 Sample Reports** with photos and location data
- **Realistic Data** for testing all features

### Sample Users
1. **Sarah Johnson** - Marine Biologist (9850 points)
2. **Ahmed Hassan** - Fisherman (8720 points)  
3. **Maria Rodriguez** - Coastal Resident (7840 points)

### Sample Reports
1. Illegal mangrove cutting (Mumbai)
2. Chemical waste dumping (Kochi)
3. Construction near protected area (Pune)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/mangrove_watch
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d
PORT=5002
NODE_ENV=development
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5002/api
```

## 📱 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Reports
- `GET /api/reports` - List reports with filtering
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report

### Dashboard
- `GET /api/dashboard/overview` - Dashboard statistics
- `GET /api/dashboard/analytics` - Detailed analytics
- `GET /api/dashboard/heatmap` - Location heatmap

### Gamification
- `GET /api/gamification/leaderboard` - User rankings
- `GET /api/gamification/achievements` - User achievements
- `GET /api/gamification/profile` - User profile

### Community
- `GET /api/community/overview` - Community statistics
- `GET /api/community/events` - Community events
- `GET /api/community/resources` - Educational resources

## 🧪 Testing

### Backend Testing
```bash
cd Backend
npm test
```

### Frontend Testing
```bash
cd Frontend
npm test
```

### Manual Testing
1. Register a new user
2. Submit a report with photos
3. Check dashboard statistics
4. View leaderboard rankings
5. Browse community resources

## 🚨 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env

2. **API Calls Failing**
   - Verify backend server is running on port 5002
   - Check CORS configuration
   - Ensure frontend .env has correct API URL

3. **No Data Displayed**
   - Run the seed script: `node seedData.js`
   - Check browser console for errors
   - Verify API responses in Network tab

4. **Authentication Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in backend .env
   - Verify token expiration settings

### Debug Mode

Enable debug logging in backend:
```env
NODE_ENV=development
DEBUG=app:*
```

## 🔮 Future Enhancements

- **Real-time Updates**: WebSocket integration for live data
- **File Upload**: Cloud storage for photos/videos
- **Advanced Analytics**: Machine learning for threat detection
- **Mobile App**: React Native version
- **API Rate Limiting**: Production-ready security
- **Caching**: Redis integration for performance

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
