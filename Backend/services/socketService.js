const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

class SocketService {
  constructor(server) {
    this.io = socketIo(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production'
          ? ['https://yourdomain.com']
          : ['http://localhost:3000', 'http://localhost:5173'],
        credentials: true
      }
    });

    // Authenticate socket connections
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
          return next(new Error('User not found'));
        }

        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.user._id}`);
      
      // Join user's personal room
      socket.join(`user:${socket.user._id}`);
      
      // Join room based on user's location
      if (socket.user.location) {
        const { coordinates } = socket.user.location;
        const locationRoom = `location:${Math.floor(coordinates[0])}:${Math.floor(coordinates[1])}`;
        socket.join(locationRoom);
      }

      // Handle report submissions
      socket.on('report:submit', (data) => {
        // Broadcast to nearby users
        this.notifyNearbyUsers('report:new', data, socket.user.location);
      });

      // Handle report updates
      socket.on('report:update', (data) => {
        this.io.to(`report:${data.reportId}`).emit('report:updated', data);
      });

      // Handle user disconnection
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.user._id}`);
      });
    });
  }

  // Notify users within a specific radius of a location
  notifyNearbyUsers(event, data, location, radiusKm = 10) {
    const { coordinates } = location;
    const locationRoom = `location:${Math.floor(coordinates[0])}:${Math.floor(coordinates[1])}`;
    this.io.to(locationRoom).emit(event, data);
  }

  // Send notification to specific user
  notifyUser(userId, event, data) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Broadcast to all connected users
  broadcast(event, data) {
    this.io.emit(event, data);
  }

  // Send notification to users with specific role
  notifyRole(role, event, data) {
    this.io.to(`role:${role}`).emit(event, data);
  }
}

module.exports = SocketService;
