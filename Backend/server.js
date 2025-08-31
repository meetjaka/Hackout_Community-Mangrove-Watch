const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const path = require("path");
const http = require("http");
require("dotenv").config();

// Set fallback environment variables if not provided
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "mangrove_watch_jwt_secret_key_2024_development";
  console.log("⚠️  JWT_SECRET not found in environment, using fallback secret");
}
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/mangrove_watch";
  console.log("⚠️  MONGODB_URI not found in environment, using fallback URI");
}
if (!process.env.PORT) {
  process.env.PORT = "5003";
  console.log("⚠️  PORT not found in environment, using fallback port 5003");
}

// Set fallback rate limiting values for development
if (!process.env.RATE_LIMIT_MAX_REQUESTS) {
  process.env.RATE_LIMIT_MAX_REQUESTS = "1000";
  console.log("⚠️  RATE_LIMIT_MAX_REQUESTS not found, using fallback: 1000 requests per 15 minutes");
}
if (!process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) {
  process.env.AUTH_RATE_LIMIT_MAX_REQUESTS = "50";
  console.log("⚠️  AUTH_RATE_LIMIT_MAX_REQUESTS not found, using fallback: 50 auth requests per 15 minutes");
}

// Import services with error handling
const SocketService = require("./services/socketService");
let weatherService, pushNotificationService;

// Try to load optional services
try {
  weatherService = require("./services/weatherService");
  pushNotificationService = require("./services/pushNotificationService");
} catch (error) {
  console.warn("Warning: Some services could not be loaded:", error.message);
}

const app = express();
const server = http.createServer(app);

// Import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const reportRoutes = require("./routes/reports");
const dashboardRoutes = require("./routes/dashboard");
const gamificationRoutes = require("./routes/gamification");
const communityRoutes = require("./routes/community");
const adminRoutes = require("./routes/admin");

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan("combined"));
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://yourdomain.com"]
        : [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
          ],
    credentials: true,
  })
);

// Rate limiting - More lenient for development
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000, // limit each IP to 1000 requests per windowMs (more lenient for dev)
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/api/health',
});

// Apply rate limiting to all API routes except auth (for development)
app.use("/api/", limiter);

// More lenient rate limiting for auth routes during development
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 50, // limit each IP to 50 auth requests per windowMs
  message: "Too many authentication attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply specific rate limiting to auth routes
app.use("/api/auth", authLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/admin", adminRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "Community Mangrove Watch API is running",
    timestamp: new Date().toISOString(),
    rateLimiting: {
      general: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
        windowMinutes: Math.round((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / (60 * 1000))
      },
      auth: {
        windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 50,
        windowMinutes: Math.round((parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / (60 * 1000))
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mangrove_watch"
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
};

// Initialize Socket.io
const socketService = new SocketService(server);

// Integrate socket instance with routes
app.set("socketService", socketService);

// Start server
const PORT = process.env.PORT || 5003;
const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 Community Mangrove Watch Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔌 WebSocket server initialized`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection:", error);
  process.exit(1);
});

startServer();

module.exports = { app, server };
