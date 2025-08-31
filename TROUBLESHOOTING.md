# Dashboard Loading Issue - Troubleshooting Guide

## 🚨 Problem
When clicking login, you get "Error Loading Dashboard" message.

## 🔍 Root Causes
1. **Backend server not running**
2. **MongoDB not connected**
3. **Environment variables not configured**
4. **Network connectivity issues**

## ✅ Quick Fixes

### 1. Check if Backend is Running
```bash
# In Backend directory
cd Backend
npm start

# You should see:
# Server running on port 5002
# Connected to MongoDB
```

### 2. Check MongoDB Connection
```bash
# Make sure MongoDB is running
mongod

# Or if using MongoDB Atlas, check your connection string
```

### 3. Check Environment Files

#### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/mangrove_watch
JWT_SECRET=your-secret-key
PORT=5002
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:5002/api
```

### 4. Seed the Database
```bash
cd Backend
npm run seed
```

## 🧪 Step-by-Step Testing

### Step 1: Test Backend
```bash
cd Backend
npm start
```
**Expected Output:**
```
Server running on port 5002
Connected to MongoDB
```

### Step 2: Test API Endpoints
Open browser and go to: `http://localhost:5002/api/community/overview`

**Expected Output:** JSON response with community data

### Step 3: Test Frontend
```bash
cd Frontend
npm run dev
```

### Step 4: Test Login Flow
1. Go to login page
2. Enter credentials
3. Check browser console for errors
4. Check Network tab for failed API calls

## 🐛 Common Error Messages

### "Unable to connect to the server"
- Backend not running
- Wrong port number
- Firewall blocking connection

### "MongoDB connection failed"
- MongoDB not running
- Wrong connection string
- Network issues

### "JWT token invalid"
- Wrong JWT_SECRET
- Token expired
- Clock synchronization issues

## 🔧 Advanced Debugging

### Enable Backend Debug Logging
```env
NODE_ENV=development
DEBUG=app:*
```

### Check Browser Console
- Network errors
- CORS issues
- JavaScript errors

### Check Backend Logs
- API request logs
- Database query logs
- Error stack traces

## 📱 Alternative Solutions

### 1. Use Mock Data (Temporary)
If backend issues persist, you can temporarily enable mock data in the dashboard.

### 2. Check Network Tab
- Look for failed HTTP requests
- Check response status codes
- Verify request headers

### 3. Test with Postman/Insomnia
Test API endpoints directly to isolate frontend vs backend issues.

## 🚀 Production Checklist

- [ ] MongoDB connection string is correct
- [ ] JWT_SECRET is set and secure
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] Backend server is running
- [ ] Database is seeded with data
- [ ] Frontend API URL is correct

## 📞 Still Having Issues?

1. **Check the console logs** in both frontend and backend
2. **Verify all environment variables** are set correctly
3. **Ensure MongoDB is running** and accessible
4. **Check if the backend server** is actually listening on port 5002
5. **Verify the database** has been seeded with sample data

## 🔄 Quick Reset
```bash
# Backend
cd Backend
npm run seed
npm start

# Frontend (in new terminal)
cd Frontend
npm run dev
```

This should resolve the dashboard loading issue!
