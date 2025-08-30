const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Report = require('../models/Report');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/community/overview
// @desc    Get community overview and statistics
// @access  Public
router.get('/overview', async (req, res) => {
  try {
    // Get community statistics from database
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalReports = await Report.countDocuments();
    
    // Get top contributors based on points
    const topContributors = await User.find({ isActive: true })
      .sort({ points: -1 })
      .limit(10)
      .select('firstName lastName avatar points level badges organization location');
    
    // Get recent community activity (recent reports)
    const recentReports = await Report.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('reporter', 'firstName lastName avatar');
    
    // Calculate active communities (based on regions with reports)
    const activeRegions = await Report.distinct('location.address.state');
    const activeCommunities = activeRegions.length;
    
    // Calculate total mangrove areas (based on unique coordinates)
    const uniqueLocations = await Report.distinct('location.coordinates');
    const totalMangroveAreas = uniqueLocations.length;
    
    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalReports,
          activeCommunities,
          totalMangroveAreas
        },
        topContributors,
        recentActivity: recentReports
      }
    });
    
  } catch (error) {
    console.error('Community overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching community overview'
    });
  }
});

// @route   GET /api/community/resources
// @desc    Get community resources and educational content
// @access  Public
router.get('/resources', async (req, res) => {
  try {
    const { category, language = 'en' } = req.query;
    
    // In a real app, you would have a Resource model
    // For now, we'll return a curated list of resources
    const resources = [
      {
        id: 'mangrove-basics',
        title: 'Understanding Mangrove Ecosystems',
        description: 'Learn about the importance of mangroves and their role in coastal protection',
        category: 'education',
        type: 'article',
        language: 'en',
        url: '/resources/mangrove-basics',
        tags: ['mangroves', 'ecosystem', 'coastal', 'conservation'],
        difficulty: 'beginner',
        estimatedTime: '10 minutes'
      },
      {
        id: 'reporting-guide',
        title: 'How to Report Incidents Effectively',
        description: 'Step-by-step guide to reporting mangrove threats and incidents',
        category: 'guide',
        type: 'tutorial',
        language: 'en',
        url: '/resources/reporting-guide',
        tags: ['reporting', 'incidents', 'guide', 'tutorial'],
        difficulty: 'beginner',
        estimatedTime: '15 minutes'
      },
      {
        id: 'photo-guidelines',
        title: 'Photo Documentation Best Practices',
        description: 'Learn how to take effective photos for incident documentation',
        category: 'guide',
        type: 'tutorial',
        language: 'en',
        url: '/resources/photo-guidelines',
        tags: ['photography', 'documentation', 'evidence', 'guidelines'],
        difficulty: 'intermediate',
        estimatedTime: '20 minutes'
      },
      {
        id: 'conservation-success',
        title: 'Success Stories in Mangrove Conservation',
        description: 'Real examples of successful mangrove restoration and protection',
        category: 'inspiration',
        type: 'case-study',
        language: 'en',
        url: '/resources/conservation-success',
        tags: ['success', 'restoration', 'protection', 'case-study'],
        difficulty: 'beginner',
        estimatedTime: '25 minutes'
      },
      {
        id: 'legal-framework',
        title: 'Legal Framework for Mangrove Protection',
        description: 'Understanding laws and regulations protecting mangrove ecosystems',
        category: 'legal',
        type: 'reference',
        language: 'en',
        url: '/resources/legal-framework',
        tags: ['legal', 'regulations', 'protection', 'law'],
        difficulty: 'advanced',
        estimatedTime: '30 minutes'
      }
    ];
    
    // Filter resources based on query parameters
    let filteredResources = resources;
    
    if (category) {
      filteredResources = filteredResources.filter(r => r.category === category);
    }
    
    if (language) {
      filteredResources = filteredResources.filter(r => r.language === language);
    }
    
    // Group resources by category
    const resourcesByCategory = filteredResources.reduce((acc, resource) => {
      if (!acc[resource.category]) {
        acc[resource.category] = [];
      }
      acc[resource.category].push(resource);
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        resources: filteredResources,
        resourcesByCategory,
        totalResources: filteredResources.length,
        categories: Object.keys(resourcesByCategory)
      }
    });
    
  } catch (error) {
    console.error('Community resources error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching resources'
    });
  }
});

// @route   GET /api/community/events
// @desc    Get community events and activities
// @access  Public
router.get('/events', async (req, res) => {
  try {
    const { upcoming = true, location, limit = 10 } = req.query;
    
    // In a real app, you would have an Event model
    // For now, we'll return a curated list of events
    const events = [
      {
        id: '1',
        title: 'Mangrove Cleanup Drive',
        description: 'Join us for a community cleanup of the local mangrove area',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        location: 'Mumbai, Maharashtra',
        coordinates: [72.8777, 19.0760],
        organizer: 'Mangrove Conservation Society',
        type: 'cleanup',
        maxParticipants: 50,
        currentParticipants: 23,
        difficulty: 'easy',
        registrationRequired: true
      },
      {
        id: '2',
        title: 'Mangrove Awareness Workshop',
        description: 'Educational workshop about mangrove ecosystems and conservation',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        location: 'Kochi, Kerala',
        coordinates: [76.2673, 9.9312],
        organizer: 'Kerala Environmental Foundation',
        type: 'workshop',
        maxParticipants: 30,
        currentParticipants: 18,
        difficulty: 'beginner',
        registrationRequired: true
      },
      {
        id: '3',
        title: 'Mangrove Photography Contest',
        description: 'Capture the beauty of mangroves and win prizes',
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        location: 'Online',
        coordinates: null,
        organizer: 'Community Mangrove Watch',
        type: 'contest',
        maxParticipants: 100,
        currentParticipants: 45,
        difficulty: 'all',
        registrationRequired: false
      }
    ];
    
    // Filter events based on query parameters
    let filteredEvents = events;
    
    if (upcoming === 'true') {
      const now = new Date();
      filteredEvents = filteredEvents.filter(event => event.date > now);
    }
    
    if (location) {
      filteredEvents = filteredEvents.filter(event => 
        event.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Sort events by date
    filteredEvents.sort((a, b) => a.date - b.date);
    
    // Apply limit
    if (limit) {
      filteredEvents = filteredEvents.slice(0, parseInt(limit));
    }
    
    res.json({
      success: true,
      data: {
        events: filteredEvents,
        totalEvents: filteredEvents.length,
        upcoming: upcoming === 'true'
      }
    });
    
  } catch (error) {
    console.error('Community events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
});

// @route   POST /api/community/events/:id/register
// @desc    Register for a community event
// @access  Private
router.post('/events/:id/register', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real app, you would have an Event model and EventRegistration model
    // For now, we'll just return a success message
    
    res.json({
      success: true,
      message: 'Successfully registered for the event',
      data: {
        eventId: id,
        userId: req.user.id,
        registrationDate: new Date()
      }
    });
    
  } catch (error) {
    console.error('Event registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering for event'
    });
  }
});

// @route   GET /api/community/forums
// @desc    Get community discussion forums
// @access  Public
router.get('/forums', async (req, res) => {
  try {
    const { category, sort = 'recent' } = req.query;
    
    // In a real app, you would have a Forum model
    // For now, we'll return a curated list of forums
    const forums = [
      {
        id: 'general',
        title: 'General Discussion',
        description: 'General topics about mangrove conservation and community',
        category: 'general',
        topics: 45,
        posts: 234,
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isActive: true
      },
      {
        id: 'technical',
        title: 'Technical Support',
        description: 'Help with app usage, reporting, and technical issues',
        category: 'support',
        topics: 23,
        posts: 89,
        lastActivity: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isActive: true
      },
      {
        id: 'conservation',
        title: 'Conservation Strategies',
        description: 'Discuss effective strategies for mangrove conservation',
        category: 'conservation',
        topics: 67,
        posts: 456,
        lastActivity: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isActive: true
      },
      {
        id: 'events',
        title: 'Events & Activities',
        description: 'Share and discuss upcoming events and activities',
        category: 'events',
        topics: 34,
        posts: 178,
        lastActivity: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        isActive: true
      }
    ];
    
    // Filter forums based on category
    let filteredForums = forums;
    if (category) {
      filteredForums = forums.filter(forum => forum.category === category);
    }
    
    // Sort forums based on sort parameter
    if (sort === 'recent') {
      filteredForums.sort((a, b) => b.lastActivity - a.lastActivity);
    } else if (sort === 'popular') {
      filteredForums.sort((a, b) => b.posts - a.posts);
    }
    
    res.json({
      success: true,
      data: {
        forums: filteredForums,
        totalForums: filteredForums.length,
        categories: [...new Set(forums.map(f => f.category))]
      }
    });
    
  } catch (error) {
    console.error('Community forums error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching forums'
    });
  }
});

// @route   GET /api/community/forums/:id/topics
// @desc    Get topics from a specific forum
// @access  Public
router.get('/forums/:id/topics', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, sort = 'recent' } = req.query;
    
    // In a real app, you would have a Topic model
    // For now, we'll return a curated list of topics
    const topics = [
      {
        id: '1',
        title: 'Best practices for mangrove photography',
        author: 'John Doe',
        authorId: 'user1',
        replies: 12,
        views: 156,
        lastReply: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        isSticky: false,
        isLocked: false
      },
      {
        id: '2',
        title: 'New mangrove species discovered in our area',
        author: 'Jane Smith',
        authorId: 'user2',
        replies: 8,
        views: 89,
        lastReply: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isSticky: true,
        isLocked: false
      },
      {
        id: '3',
        title: 'How to organize a community cleanup event',
        author: 'Mike Johnson',
        authorId: 'user3',
        replies: 23,
        views: 234,
        lastReply: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        isSticky: false,
        isLocked: false
      }
    ];
    
    // Sort topics based on sort parameter
    if (sort === 'recent') {
      topics.sort((a, b) => b.lastReply - a.lastReply);
    } else if (sort === 'popular') {
      topics.sort((a, b) => b.views - a.views);
    } else if (sort === 'replies') {
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
          hasPrevPage: parseInt(page) > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Forum topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching forum topics'
    });
  }
});

// @route   GET /api/community/partners
// @desc    Get community partners and organizations
// @access  Public
router.get('/partners', async (req, res) => {
  try {
    const { type, region } = req.query;
    
    // In a real app, you would have a Partner model
    // For now, we'll return a curated list of partners
    const partners = [
      {
        id: '1',
        name: 'Mangrove Conservation Society',
        type: 'ngo',
        region: 'Maharashtra',
        description: 'Dedicated to protecting and restoring mangrove ecosystems in Maharashtra',
        website: 'https://example.com',
        logo: '/logos/mcs.png',
        focusAreas: ['conservation', 'restoration', 'education'],
        projects: 15,
        members: 250
      },
      {
        id: '2',
        name: 'Kerala Environmental Foundation',
        type: 'ngo',
        region: 'Kerala',
        description: 'Working towards environmental conservation including mangrove protection',
        website: 'https://example.com',
        logo: '/logos/kef.png',
        focusAreas: ['environmental', 'conservation', 'research'],
        projects: 8,
        members: 120
      },
      {
        id: '3',
        name: 'Forest Department - Maharashtra',
        type: 'government',
        region: 'Maharashtra',
        description: 'Official government body responsible for forest and mangrove management',
        website: 'https://example.com',
        logo: '/logos/forest-dept.png',
        focusAreas: ['management', 'enforcement', 'policy'],
        projects: 25,
        members: 500
      }
    ];
    
    // Filter partners based on query parameters
    let filteredPartners = partners;
    
    if (type) {
      filteredPartners = filteredPartners.filter(partner => partner.type === type);
    }
    
    if (region) {
      filteredPartners = filteredPartners.filter(partner => partner.region === region);
    }
    
    res.json({
      success: true,
      data: {
        partners: filteredPartners,
        totalPartners: filteredPartners.length,
        types: [...new Set(partners.map(p => p.type))],
        regions: [...new Set(partners.map(p => p.region))]
      }
    });
    
  } catch (error) {
    console.error('Community partners error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching partners'
    });
  }
});

module.exports = router;
