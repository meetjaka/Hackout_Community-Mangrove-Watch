const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Report = require("../models/Report");
const Community = require("../models/Community");
const { auth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

// @route   GET /api/community/overview
// @desc    Get community overview and statistics
// @access  Public
router.get("/overview", async (req, res) => {
  try {
    // Get community data from database
    const community = await Community.findOne({ isActive: true });

    if (!community) {
      // Fallback to real-time calculation if no community data exists
      const totalUsers = await User.countDocuments({ isActive: true });
      const totalReports = await Report.countDocuments();

      // Get top contributors based on points
      const topContributors = await User.find({ isActive: true })
        .sort({ points: -1 })
        .limit(10)
        .select(
          "firstName lastName avatar points level badges organization location"
        );

      // Get recent community activity (recent reports)
      const recentReports = await Report.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("reporter", "firstName lastName avatar");

      // Calculate active communities (based on regions with reports)
      const activeRegions = await Report.distinct("location.address.state");
      const activeCommunities = activeRegions.length;

      // Calculate total mangrove areas (based on unique coordinates)
      const uniqueLocations = await Report.distinct("location.coordinates");
      const totalMangroveAreas = uniqueLocations.length;

      return res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            totalReports,
            activeCommunities,
            totalMangroveAreas,
          },
          topContributors,
          recentActivity: recentReports,
        },
      });
    }

    // Update community stats in real-time
    await community.updateStats();

    // Get top contributors
    const topContributors = await User.find({ isActive: true })
      .sort({ points: -1 })
      .limit(10)
      .select(
        "firstName lastName avatar points level badges organization location"
      );

    // Get recent community activity
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("reporter", "firstName lastName avatar");

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers: community.totalMembers,
          totalReports: community.totalReports,
          activeCommunities:
            community.activeMembers > 0
              ? Math.ceil(community.activeMembers / 10)
              : 1,
          totalMangroveAreas: community.totalMangroveAreas,
        },
        topContributors,
        recentActivity: recentReports,
        communityInfo: {
          name: community.name,
          description: community.description,
          location: community.location,
        },
      },
    });
  } catch (error) {
    console.error("Community overview error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching community overview",
    });
  }
});

// @route   GET /api/community/resources
// @desc    Get community resources and educational content
// @access  Public
router.get("/resources", async (req, res) => {
  try {
    const { category, language = "en", search, difficulty } = req.query;

    // Get community data from database
    const community = await Community.findOne({ isActive: true });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    // Get resources from community data
    let resources = community.resources.filter((r) => r.isActive);

    // Apply filters
    if (category) {
      resources = resources.filter((r) => r.category === category);
    }

    if (language) {
      resources = resources.filter((r) => r.language === language);
    }

    if (difficulty) {
      resources = resources.filter((r) => r.difficulty === difficulty);
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      resources = resources.filter(
        (r) =>
          r.title.toLowerCase().includes(searchLower) ||
          r.description.toLowerCase().includes(searchLower) ||
          r.tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    }

    // Group resources by category
    const resourcesByCategory = resources.reduce((acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
      return acc;
    }, {});

    // Sort resources by creation date (newest first)
    resources.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({
      success: true,
      data: {
        resources: resources,
        resourcesByCategory,
        totalResources: resources.length,
        categories: Object.keys(resourcesByCategory),
        filters: {
          applied: { category, language, search, difficulty },
          available: {
            categories: [
              ...new Set(community.resources.map((r) => r.category)),
            ],
            difficulties: [
              ...new Set(community.resources.map((r) => r.difficulty)),
            ],
            languages: [...new Set(community.resources.map((r) => r.language))],
          },
        },
      },
    });
  } catch (error) {
    console.error("Community resources error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching resources",
    });
  }
});

// @route   GET /api/community/events
// @desc    Get community events and activities
// @access  Public
router.get("/events", async (req, res) => {
  try {
    const {
      upcoming = true,
      location,
      limit = 10,
      type,
      difficulty,
    } = req.query;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    let events = community.events.filter((e) => e.isActive);

    // Filter events based on query parameters
    if (upcoming === "true") {
      const now = new Date();
      events = events.filter((event) => event.date > now);
    }

    if (location) {
      events = events.filter((event) =>
        event.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (type) {
      events = events.filter((event) => event.type === type);
    }

    if (difficulty) {
      events = events.filter((event) => event.difficulty === difficulty);
    }

    // Sort events by date
    events.sort((a, b) => a.date - b.date);

    // Apply limit
    if (limit) {
      events = events.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: {
        events: events,
        totalEvents: events.length,
        upcoming: upcoming === "true",
      },
    });
  } catch (error) {
    console.error("Community events error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching events",
    });
  }
});

// @route   GET /api/community/events/:id
// @desc    Get specific event details
// @access  Public
router.get("/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const event = community.events.find(
      (e) => e._id.toString() === id && e.isActive
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error("Event details error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching event details",
    });
  }
});

// @route   POST /api/community/events/:id/register
// @desc    Register for a community event
// @access  Private
router.post("/events/:id/register", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { additionalInfo } = req.body;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const event = community.events.find(
      (e) => e._id.toString() === id && e.isActive
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    // Check if event is full
    if (event.currentParticipants >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: "Event is full",
      });
    }

    // Check if user is already registered
    if (!event.registrations) {
      event.registrations = [];
    }

    const existingRegistration = event.registrations.find(
      (r) => r.userId.toString() === userId
    );
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        message: "Already registered for this event",
      });
    }

    // Add registration
    event.registrations.push({
      userId: userId,
      registrationDate: new Date(),
      additionalInfo: additionalInfo || "",
      status: "confirmed",
    });

    // Increment participant count
    event.currentParticipants += 1;

    await community.save();

    res.json({
      success: true,
      message: "Successfully registered for the event",
      data: {
        eventId: id,
        userId: userId,
        registrationDate: new Date(),
        currentParticipants: event.currentParticipants,
        maxParticipants: event.maxParticipants,
      },
    });
  } catch (error) {
    console.error("Event registration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while registering for event",
    });
  }
});

// @route   POST /api/community/events/:id/unregister
// @desc    Unregister from a community event
// @access  Private
router.post("/events/:id/unregister", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const event = community.events.find(
      (e) => e._id.toString() === id && e.isActive
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.registrations) {
      return res.status(400).json({
        success: false,
        message: "No registrations found for this event",
      });
    }

    const registrationIndex = event.registrations.findIndex(
      (r) => r.userId.toString() === userId
    );
    if (registrationIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "Not registered for this event",
      });
    }

    // Remove registration
    event.registrations.splice(registrationIndex, 1);
    event.currentParticipants = Math.max(0, event.currentParticipants - 1);

    await community.save();

    res.json({
      success: true,
      message: "Successfully unregistered from the event",
      data: {
        eventId: id,
        userId: userId,
        currentParticipants: event.currentParticipants,
        maxParticipants: event.maxParticipants,
      },
    });
  } catch (error) {
    console.error("Event unregistration error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while unregistering from event",
    });
  }
});

// @route   GET /api/community/events/:id/participants
// @desc    Get event participants list
// @access  Private
router.get("/events/:id/participants", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const event = community.events.find(
      (e) => e._id.toString() === id && e.isActive
    );
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }

    if (!event.registrations) {
      return res.json({
        success: true,
        data: {
          participants: [],
          totalParticipants: 0,
        },
      });
    }

    // Get participant details
    const participants = await Promise.all(
      event.registrations.map(async (registration) => {
        const user = await User.findById(registration.userId).select(
          "firstName lastName avatar organization"
        );
        return {
          userId: registration.userId,
          firstName: user?.firstName || "Unknown",
          lastName: user?.lastName || "User",
          avatar: user?.avatar,
          organization: user?.organization,
          registrationDate: registration.registrationDate,
          additionalInfo: registration.additionalInfo,
          status: registration.status,
        };
      })
    );

    res.json({
      success: true,
      data: {
        participants,
        totalParticipants: participants.length,
      },
    });
  } catch (error) {
    console.error("Event participants error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching event participants",
    });
  }
});

// @route   GET /api/community/forums
// @desc    Get community discussion forums
// @access  Public
router.get("/forums", async (req, res) => {
  try {
    const { category, sort = "recent" } = req.query;

    // In a real app, you would have a Forum model
    // For now, we'll return a curated list of forums
    const forums = [
      {
        id: "general",
        title: "General Discussion",
        description: "General topics about mangrove conservation and community",
        category: "general",
        topics: 45,
        posts: 234,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isActive: true,
      },
      {
        id: "technical",
        title: "Technical Support",
        description: "Help with app usage, reporting, and technical issues",
        category: "support",
        topics: 23,
        posts: 89,
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isActive: true,
      },
      {
        id: "conservation",
        title: "Conservation Strategies",
        description: "Discuss effective strategies for mangrove conservation",
        category: "conservation",
        topics: 67,
        posts: 456,
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isActive: true,
      },
      {
        id: "events",
        title: "Events & Activities",
        description: "Share and discuss upcoming events and activities",
        category: "events",
        topics: 34,
        posts: 178,
        lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isActive: true,
      },
    ];

    // Filter forums based on category
    let filteredForums = forums;
    if (category) {
      filteredForums = forums.filter((forum) => forum.category === category);
    }

    // Sort forums based on sort parameter
    if (sort === "recent") {
      filteredForums.sort((a, b) => b.lastActivity - a.lastActivity);
    } else if (sort === "popular") {
      filteredForums.sort((a, b) => b.posts - a.posts);
    }

    res.json({
      success: true,
      data: {
        forums: filteredForums,
        totalForums: filteredForums.length,
        categories: [...new Set(forums.map((f) => f.category))],
      },
    });
  } catch (error) {
    console.error("Community forums error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching forums",
    });
  }
});

// @route   GET /api/community/forums/:id/topics
// @desc    Get topics from a specific forum
// @access  Public
router.get("/forums/:id/topics", async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sort = "recent" } = req.query;

    // In a real app, you would have a Topic model
    // For now, we'll return a curated list of topics
    const topics = [
      {
        id: "1",
        title: "Best practices for mangrove photography",
        author: "John Doe",
        authorId: "user1",
        replies: 12,
        views: 156,
        lastReply: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isSticky: false,
        isLocked: false,
      },
      {
        id: "2",
        title: "New mangrove species discovered in our area",
        author: "Jane Smith",
        authorId: "user2",
        replies: 8,
        views: 89,
        lastReply: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isSticky: true,
        isLocked: false,
      },
      {
        id: "3",
        title: "How to organize a community cleanup event",
        author: "Mike Johnson",
        authorId: "user3",
        replies: 23,
        views: 234,
        lastReply: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isSticky: false,
        isLocked: false,
      },
    ];

    // Sort topics based on sort parameter
    if (sort === "recent") {
      topics.sort((a, b) => b.lastReply - a.lastReply);
    } else if (sort === "popular") {
      topics.sort((a, b) => b.views - a.views);
    } else if (sort === "replies") {
      topics.sort((a, b) => b.replies - a.replies);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedTopics = topics.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: {
        topics: paginatedTopics,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(topics.length / parseInt(limit)),
          totalTopics: topics.length,
          hasNextPage: skip + paginatedTopics.length < topics.length,
          hasPrevPage: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Forum topics error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching forum topics",
    });
  }
});

// @route   GET /api/community/guidelines
// @desc    Get community guidelines
// @access  Public
router.get("/guidelines", async (req, res) => {
  try {
    // Get community data from database
    const community = await Community.findOne({ isActive: true });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    // Get active guidelines and sort by order
    const guidelines = community.guidelines
      .filter((g) => g.isActive)
      .sort((a, b) => a.order - b.order);

    res.json({
      success: true,
      data: {
        guidelines,
        totalGuidelines: guidelines.length,
      },
    });
  } catch (error) {
    console.error("Community guidelines error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching guidelines",
    });
  }
});

// @route   GET /api/community/partners
// @desc    Get community partners and organizations
// @access  Public
router.get("/partners", async (req, res) => {
  try {
    const { type, region } = req.query;

    // Get community data from database
    const community = await Community.findOne({ isActive: true });

    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    // Get active partners from community data
    let partners = community.partners.filter((p) => p.isActive);

    // Apply filters
    if (type) {
      partners = partners.filter((partner) => partner.type === type);
    }

    if (region) {
      partners = partners.filter((partner) => partner.region === region);
    }

    res.json({
      success: true,
      data: {
        partners,
        totalPartners: partners.length,
        types: [...new Set(community.partners.map((p) => p.type))],
        regions: [...new Set(community.partners.map((p) => p.region))],
      },
    });
  } catch (error) {
    console.error("Community partners error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching partners",
    });
  }
});

// User Interaction Routes
// @route   POST /api/community/resources/:id/like
// @desc    Like/unlike an educational resource
// @access  Private
router.post("/resources/:id/like", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const resource = community.resources.find((r) => r._id.toString() === id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Initialize likes array if it doesn't exist
    if (!resource.likes) {
      resource.likes = [];
    }

    const likeIndex = resource.likes.indexOf(userId);
    if (likeIndex > -1) {
      // Unlike
      resource.likes.splice(likeIndex, 1);
      await community.save();

      res.json({
        success: true,
        message: "Resource unliked successfully",
        data: { liked: false, likesCount: resource.likes.length },
      });
    } else {
      // Like
      resource.likes.push(userId);
      await community.save();

      res.json({
        success: true,
        message: "Resource liked successfully",
        data: { liked: true, likesCount: resource.likes.length },
      });
    }
  } catch (error) {
    console.error("Resource like error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing like",
    });
  }
});

// @route   POST /api/community/resources/:id/favorite
// @desc    Add/remove resource from favorites
// @access  Private
router.post("/resources/:id/favorite", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const resource = community.resources.find((r) => r._id.toString() === id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Initialize favorites array if it doesn't exist
    if (!resource.favorites) {
      resource.favorites = [];
    }

    const favoriteIndex = resource.favorites.indexOf(userId);
    if (favoriteIndex > -1) {
      // Remove from favorites
      resource.favorites.splice(favoriteIndex, 1);
      await community.save();

      res.json({
        success: true,
        message: "Resource removed from favorites",
        data: { favorited: false, favoritesCount: resource.favorites.length },
      });
    } else {
      // Add to favorites
      resource.favorites.push(userId);
      await community.save();

      res.json({
        success: true,
        message: "Resource added to favorites",
        data: { favorited: true, favoritesCount: resource.favorites.length },
      });
    }
  } catch (error) {
    console.error("Resource favorite error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing favorite",
    });
  }
});

// @route   GET /api/community/resources/:id/interactions
// @desc    Get resource interaction data (likes, favorites, etc.)
// @access  Public
router.get("/resources/:id/interactions", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Optional auth

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const resource = community.resources.find((r) => r._id.toString() === id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const interactions = {
      likesCount: resource.likes?.length || 0,
      favoritesCount: resource.favorites?.length || 0,
      userLiked: userId ? resource.likes?.includes(userId) || false : false,
      userFavorited: userId
        ? resource.favorites?.includes(userId) || false
        : false,
    };

    res.json({
      success: true,
      data: interactions,
    });
  } catch (error) {
    console.error("Resource interactions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching interactions",
    });
  }
});

// @route   GET /api/community/user/favorites
// @desc    Get user's favorite resources
// @access  Private
router.get("/user/favorites", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const favoriteResources = community.resources.filter(
      (r) => r.isActive && r.favorites?.includes(userId)
    );

    res.json({
      success: true,
      data: {
        resources: favoriteResources,
        totalFavorites: favoriteResources.length,
      },
    });
  } catch (error) {
    console.error("User favorites error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching favorites",
    });
  }
});

// @route   POST /api/community/resources/:id/share
// @desc    Share a resource (increment share count)
// @access  Private
router.post("/resources/:id/share", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, message } = req.body;

    const community = await Community.findOne({ isActive: true });
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community data not found",
      });
    }

    const resource = community.resources.find((r) => r._id.toString() === id);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    // Initialize share count if it doesn't exist
    if (!resource.shareCount) {
      resource.shareCount = 0;
    }

    // Increment share count
    resource.shareCount += 1;

    // Track share details
    if (!resource.shares) {
      resource.shares = [];
    }

    resource.shares.push({
      userId: req.user.id,
      platform: platform || "app",
      message: message || "",
      timestamp: new Date(),
    });

    await community.save();

    res.json({
      success: true,
      message: "Resource shared successfully",
      data: { shareCount: resource.shareCount },
    });
  } catch (error) {
    console.error("Resource share error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while processing share",
    });
  }
});

// @route   POST /api/community/create
// @desc    Create a new community (for users)
// @access  Private
router.post("/create", auth, async (req, res) => {
  try {
    const { name, description, location, focusAreas, contactInfo } = req.body;

    // Validate required fields
    if (!name || !description || !location || !location.coordinates) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and location coordinates are required",
      });
    }

    // Ensure location has proper structure
    const formattedLocation = {
      type: "Point",
      coordinates: location.coordinates,
      address: location.address || {},
    };

    // Check if community already exists
    const existingCommunity = await Community.findOne({ name: name });
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        message: "Community with this name already exists",
      });
    }

    // Create new community
    const newCommunity = new Community({
      name,
      description,
      location: formattedLocation,
      focusAreas: focusAreas || [],
      contactInfo: contactInfo || {},
      creator: req.user._id,
      admins: [req.user._id],
      members: [req.user._id],
      isActive: true,
      resources: [],
      guidelines: [],
      totalMembers: 1,
      activeMembers: 1,
      events: [],
      partners: [],
      totalMembers: 1, // Creator is first member
      activeMembers: 1,
      totalReports: 0,
      totalMangroveAreas: 0,
      creator: req.user.id,
      members: [
        {
          userId: req.user.id,
          role: "admin",
          joinedAt: new Date(),
          isActive: true,
        },
      ],
    });

    await newCommunity.save();

    res.status(201).json({
      success: true,
      message: "Community created successfully",
      data: newCommunity,
    });
  } catch (error) {
    console.error("Create community error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating community",
    });
  }
});

// @route   POST /api/community/:id/join
// @desc    Join a community
// @access  Private
router.post("/:id/join", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    if (!community.isActive) {
      return res.status(400).json({
        success: false,
        message: "Community is not active",
      });
    }

    // Check if user is already a member
    const existingMember = community.members?.find(
      (m) => m.userId.toString() === userId
    );
    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this community",
      });
    }

    // Add user to community
    if (!community.members) {
      community.members = [];
    }

    community.members.push({
      userId: userId,
      role: "member",
      joinedAt: new Date(),
      isActive: true,
    });

    community.totalMembers += 1;
    community.activeMembers += 1;

    await community.save();

    res.json({
      success: true,
      message: "Successfully joined the community",
      data: {
        communityId: id,
        userId: userId,
        totalMembers: community.totalMembers,
      },
    });
  } catch (error) {
    console.error("Join community error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while joining community",
    });
  }
});

// @route   POST /api/community/:id/leave
// @desc    Leave a community
// @access  Private
router.post("/:id/leave", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: "Community not found",
      });
    }

    // Check if user is a member
    const memberIndex = community.members?.findIndex(
      (m) => m.userId.toString() === userId
    );
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: "You are not a member of this community",
      });
    }

    // Check if user is the creator (cannot leave if creator)
    if (community.creator?.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: "Community creator cannot leave. Transfer ownership first.",
      });
    }

    // Remove user from community
    community.members.splice(memberIndex, 1);
    community.totalMembers = Math.max(0, community.totalMembers - 1);
    community.activeMembers = Math.max(0, community.activeMembers - 1);

    await community.save();

    res.json({
      success: true,
      message: "Successfully left the community",
      data: {
        communityId: id,
        userId: userId,
        totalMembers: community.totalMembers,
      },
    });
  } catch (error) {
    console.error("Leave community error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while leaving community",
    });
  }
});

// @route   GET /api/community/my-communities
// @desc    Get communities where user is a member
// @access  Private
router.get("/my-communities", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const communities = await Community.find({
      "members.userId": userId,
      isActive: true,
    }).select("name description location totalMembers totalReports focusAreas");

    res.json({
      success: true,
      data: {
        communities,
        totalCommunities: communities.length,
      },
    });
  } catch (error) {
    console.error("Get my communities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching communities",
    });
  }
});

// @route   GET /api/community/discover
// @desc    Get communities available to join
// @access  Private
router.get("/discover", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { search, location, focusArea } = req.query;

    let filter = { isActive: true };

    // Exclude communities where user is already a member
    filter["members.userId"] = { $ne: userId };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (location) {
      filter["location.city"] = { $regex: location, $options: "i" };
    }

    if (focusArea) {
      filter.focusAreas = { $in: [focusArea] };
    }

    const communities = await Community.find(filter)
      .select("name description location totalMembers totalReports focusAreas")
      .limit(20);

    res.json({
      success: true,
      data: {
        communities,
        totalCommunities: communities.length,
      },
    });
  } catch (error) {
    console.error("Discover communities error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while discovering communities",
    });
  }
});

module.exports = router;
