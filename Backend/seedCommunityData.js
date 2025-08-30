const mongoose = require('mongoose');
require('dotenv').config();

// Import models in the correct order to avoid schema registration issues
const User = require('./models/User');
const Report = require('./models/Report');
const Community = require('./models/Community');

const seedCommunityData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mangrove_watch');
    console.log('Connected to MongoDB');

    // Check if community data already exists
    const existingCommunity = await Community.findOne();
    if (existingCommunity) {
      console.log('Community data already exists, skipping seed');
      return;
    }

    // Get a user to use as creator
    const user = await User.findOne();
    if (!user) {
      console.log('No users found, please run user seed first');
      return;
    }

    // Create community data
    const communityData = {
      name: 'Community Mangrove Watch',
      description: 'A participatory monitoring system for mangrove ecosystems that enables local communities, researchers, government officials, and NGOs to collaboratively monitor, report, and protect mangrove habitats.',
      location: {
        type: 'Point',
        coordinates: [72.8777, 19.0760], // Mumbai coordinates
        address: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India'
        }
      },
      totalMembers: 0,
      activeMembers: 0,
      totalReports: 0,
      totalMangroveAreas: 0,
      
      // Community Guidelines
      guidelines: [
        {
          title: 'Respect and protect mangrove ecosystems during all activities',
          description: 'Always prioritize the health and safety of mangrove ecosystems in all your activities and reports.',
          order: 1,
          isActive: true
        },
        {
          title: 'Report any suspicious or harmful activities to local authorities',
          description: 'If you observe any activities that could harm mangroves, report them immediately through the app and to local authorities.',
          order: 2,
          isActive: true
        },
        {
          title: 'Participate in regular community meetings and conservation events',
          description: 'Stay engaged with the community by attending meetings, workshops, and conservation events.',
          order: 3,
          isActive: true
        },
        {
          title: 'Share knowledge and experiences with other community members',
          description: 'Contribute to community learning by sharing your experiences, knowledge, and best practices.',
          order: 4,
          isActive: true
        },
        {
          title: 'Follow proper documentation and reporting procedures',
          description: 'Use the app correctly to document incidents, take clear photos, and provide accurate location data.',
          order: 5,
          isActive: true
        },
        {
          title: 'Respect local customs and traditional knowledge',
          description: 'Honor and learn from local communities who have traditional knowledge about mangrove ecosystems.',
          order: 6,
          isActive: true
        }
      ],
      
      // Educational Resources
      resources: [
        {
          title: 'Understanding Mangrove Ecosystems',
          description: 'Learn about the importance of mangroves and their role in coastal protection, biodiversity, and climate change mitigation.',
          category: 'education',
          type: 'article',
          url: '/resources/mangrove-basics',
          tags: ['mangroves', 'ecosystem', 'coastal', 'conservation', 'biodiversity'],
          difficulty: 'beginner',
          estimatedTime: '10 minutes',
          language: 'en',
          isActive: true
        },
        {
          title: 'How to Report Incidents Effectively',
          description: 'Step-by-step guide to reporting mangrove threats, pollution incidents, and illegal activities through the app.',
          category: 'guide',
          type: 'tutorial',
          url: '/resources/reporting-guide',
          tags: ['reporting', 'incidents', 'guide', 'tutorial', 'app-usage'],
          difficulty: 'beginner',
          estimatedTime: '15 minutes',
          language: 'en',
          isActive: true
        },
        {
          title: 'Photo Documentation Best Practices',
          description: 'Learn how to take effective photos for incident documentation, including composition, lighting, and metadata requirements.',
          category: 'guide',
          type: 'tutorial',
          url: '/resources/photo-guidelines',
          tags: ['photography', 'documentation', 'evidence', 'guidelines', 'quality'],
          difficulty: 'intermediate',
          estimatedTime: '20 minutes',
          language: 'en',
          isActive: true
        },
        {
          title: 'Success Stories in Mangrove Conservation',
          description: 'Real examples of successful mangrove restoration and protection projects from around the world.',
          category: 'inspiration',
          type: 'case-study',
          url: '/resources/conservation-success',
          tags: ['success', 'restoration', 'protection', 'case-study', 'motivation'],
          difficulty: 'beginner',
          estimatedTime: '25 minutes',
          language: 'en',
          isActive: true
        },
        {
          title: 'Legal Framework for Mangrove Protection',
          description: 'Understanding laws and regulations protecting mangrove ecosystems in India and international frameworks.',
          category: 'legal',
          type: 'reference',
          url: '/resources/legal-framework',
          tags: ['legal', 'regulations', 'protection', 'law', 'policy'],
          difficulty: 'advanced',
          estimatedTime: '30 minutes',
          language: 'en',
          isActive: true
        },
        {
          title: 'Community Organizing for Conservation',
          description: 'How to organize and manage community conservation efforts, including event planning and volunteer coordination.',
          category: 'guide',
          type: 'tutorial',
          url: '/resources/community-organizing',
          tags: ['community', 'organizing', 'events', 'volunteers', 'leadership'],
          difficulty: 'intermediate',
          estimatedTime: '35 minutes',
          language: 'en',
          isActive: true
        },
        {
          title: 'Mangrove Species Identification',
          description: 'Guide to identifying different mangrove species found in Indian coastal areas.',
          category: 'education',
          type: 'reference',
          url: '/resources/species-identification',
          tags: ['species', 'identification', 'botany', 'coastal', 'biodiversity'],
          difficulty: 'intermediate',
          estimatedTime: '40 minutes',
          language: 'en',
          isActive: true
        },
        {
          title: 'Climate Change and Mangroves',
          description: 'Understanding the impact of climate change on mangrove ecosystems and adaptation strategies.',
          category: 'education',
          type: 'article',
          url: '/resources/climate-change',
          tags: ['climate-change', 'adaptation', 'resilience', 'global-warming'],
          difficulty: 'intermediate',
          estimatedTime: '20 minutes',
          language: 'en',
          isActive: true
        }
      ],
      
      // Community Events
      events: [
        {
          title: 'Mangrove Cleanup Drive',
          description: 'Join us for a community cleanup of the local mangrove area. We\'ll remove plastic waste and debris to protect the ecosystem.',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          location: 'Mumbai, Maharashtra',
          coordinates: [72.8777, 19.0760],
          organizer: 'Mangrove Conservation Society',
          type: 'cleanup',
          maxParticipants: 50,
          currentParticipants: 23,
          difficulty: 'easy',
          registrationRequired: true,
          isActive: true
        },
        {
          title: 'Mangrove Awareness Workshop',
          description: 'Educational workshop about mangrove ecosystems, their importance, and how communities can contribute to conservation.',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
          location: 'Kochi, Kerala',
          coordinates: [76.2673, 9.9312],
          organizer: 'Kerala Environmental Foundation',
          type: 'workshop',
          maxParticipants: 30,
          currentParticipants: 18,
          difficulty: 'easy',
          registrationRequired: true,
          isActive: true
        },
        {
          title: 'Mangrove Photography Contest',
          description: 'Capture the beauty of mangroves and win prizes. Submit your best photos showcasing mangrove ecosystems and conservation efforts.',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
          location: 'Online',
          coordinates: null,
          organizer: 'Community Mangrove Watch',
          type: 'contest',
          maxParticipants: 100,
          currentParticipants: 45,
          difficulty: 'all',
          registrationRequired: false,
          isActive: true
        },
        {
          title: 'Community Conservation Meeting',
          description: 'Monthly meeting to discuss ongoing conservation projects, share updates, and plan future activities.',
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          location: 'Chennai, Tamil Nadu',
          coordinates: [80.2707, 13.0827],
          organizer: 'Tamil Nadu Mangrove Network',
          type: 'meeting',
          maxParticipants: 40,
          currentParticipants: 15,
          difficulty: 'all',
          registrationRequired: false,
          isActive: true
        }
      ],
      
      // Community Partners
      partners: [
        {
          name: 'Mangrove Conservation Society',
          type: 'ngo',
          region: 'Maharashtra',
          description: 'Dedicated to protecting and restoring mangrove ecosystems in Maharashtra through community engagement and scientific research.',
          website: 'https://example.com',
          logo: '/logos/mcs.png',
          focusAreas: ['conservation', 'restoration', 'education', 'research'],
          projects: 15,
          members: 250,
          isActive: true
        },
        {
          name: 'Kerala Environmental Foundation',
          type: 'ngo',
          region: 'Kerala',
          description: 'Working towards environmental conservation including mangrove protection through community-based initiatives.',
          website: 'https://example.com',
          logo: '/logos/kef.png',
          focusAreas: ['environmental', 'conservation', 'research', 'community'],
          projects: 8,
          members: 120,
          isActive: true
        },
        {
          name: 'Forest Department - Maharashtra',
          type: 'government',
          region: 'Maharashtra',
          description: 'Official government body responsible for forest and mangrove management, enforcement, and policy implementation.',
          website: 'https://example.com',
          logo: '/logos/forest-dept.png',
          focusAreas: ['management', 'enforcement', 'policy', 'regulation'],
          projects: 25,
          members: 500,
          isActive: true
        },
        {
          name: 'National Institute of Oceanography',
          type: 'research_institute',
          region: 'Goa',
          description: 'Leading research institution studying marine ecosystems including mangroves and their role in coastal protection.',
          website: 'https://example.com',
          logo: '/logos/nio.png',
          focusAreas: ['research', 'marine-science', 'ecosystem-studies', 'conservation'],
          projects: 12,
          members: 80,
          isActive: true
        },
        {
          name: 'Coastal Communities Alliance',
          type: 'ngo',
          region: 'Tamil Nadu',
          description: 'Network of coastal communities working together to protect marine ecosystems and traditional livelihoods.',
          website: 'https://example.com',
          logo: '/logos/cca.png',
          focusAreas: ['community', 'livelihoods', 'traditional-knowledge', 'conservation'],
          projects: 6,
          members: 180,
          isActive: true
        }
      ],
      
      // Community Settings
      settings: {
        allowPublicAccess: true,
        requireApproval: false,
        maxFileSize: 10485760, // 10MB
        allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
        autoModeration: true
      },
      
      isActive: true,
      createdBy: user._id,
      moderators: [user._id]
    };

    // Create the community
    const community = new Community(communityData);
    await community.save();
    
    // Update stats
    await community.updateStats();
    
    console.log('✅ Community data seeded successfully');
    console.log(`📊 Created community: ${community.name}`);
    console.log(`📚 Added ${community.resources.length} educational resources`);
    console.log(`📋 Added ${community.guidelines.length} community guidelines`);
    console.log(`🎉 Added ${community.events.length} community events`);
    console.log(`🤝 Added ${community.partners.length} community partners`);
    
  } catch (error) {
    console.error('❌ Error seeding community data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the seed function
seedCommunityData();
