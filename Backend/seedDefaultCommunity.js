const mongoose = require('mongoose');
const Community = require('./models/Community');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mangrove_watch', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const defaultCommunity = {
  name: "Community Mangrove Watch",
  description: "A collaborative platform for participatory monitoring of mangrove ecosystems, enabling local communities, researchers, government officials, and NGOs to collaboratively monitor, report, and protect mangrove habitats.",
  location: {
    address: "Mumbai, Maharashtra",
    city: "Mumbai",
    state: "Maharashtra",
    country: "India",
    coordinates: [19.0760, 72.8777]
  },
  focusAreas: [
    "Mangrove Conservation",
    "Community Engagement",
    "Environmental Education",
    "Research Collaboration",
    "Policy Advocacy"
  ],
  contactInfo: {
    email: "info@mangrovewatch.org",
    phone: "+91-22-1234-5678",
    website: "https://mangrovewatch.org"
  },
  isActive: true,
  resources: [],
  guidelines: [],
  events: [],
  partners: [],
  totalMembers: 1,
  activeMembers: 1,
  totalReports: 0,
  totalMangroveAreas: 0,
  creator: "000000000000000000000001", // Placeholder ObjectId
  members: [{
    userId: "000000000000000000000001", // Placeholder ObjectId
    role: "admin",
    joinedAt: new Date(),
    isActive: true
  }]
};

async function seedDefaultCommunity() {
  try {
    console.log('🌱 Starting to seed default community...');
    
    // Check if community already exists
    const existingCommunity = await Community.findOne({ name: defaultCommunity.name });
    if (existingCommunity) {
      console.log('✅ Default community already exists, skipping...');
      return;
    }

    // Create new community
    const community = new Community(defaultCommunity);
    await community.save();
    
    console.log('✅ Default community created successfully!');
    console.log('📋 Community Details:');
    console.log(`   Name: ${community.name}`);
    console.log(`   Location: ${community.location.city}, ${community.location.state}`);
    console.log(`   Focus Areas: ${community.focusAreas.join(', ')}`);
    
  } catch (error) {
    console.error('❌ Error seeding default community:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the seeding function
seedDefaultCommunity();
