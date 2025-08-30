const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

// Sample user data
const sampleUsers = [
  {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1234567890',
    password: 'password123',
    role: 'marine_biologist',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760]
    },
    address: {
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India'
    },
    points: 9850,
    level: 8,
    badges: [
      { name: 'Expert', description: 'Expert level contributor', earnedAt: new Date() },
      { name: 'Conservationist', description: 'Dedicated to conservation', earnedAt: new Date() }
    ],
    organization: {
      name: 'Marine Conservation Institute',
      type: 'research_institute',
      position: 'Senior Researcher'
    }
  },
  {
    firstName: 'Ahmed',
    lastName: 'Hassan',
    email: 'ahmed.hassan@example.com',
    phone: '+1234567891',
    password: 'password123',
    role: 'fisherman',
    location: {
      type: 'Point',
      coordinates: [76.2673, 9.9312]
    },
    address: {
      city: 'Kochi',
      state: 'Kerala',
      country: 'India'
    },
    points: 8720,
    level: 7,
    badges: [
      { name: 'Veteran', description: 'Long-term contributor', earnedAt: new Date() }
    ]
  },
  {
    firstName: 'Maria',
    lastName: 'Rodriguez',
    email: 'maria.rodriguez@example.com',
    phone: '+1234567892',
    password: 'password123',
    role: 'coastal_resident',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204]
    },
    address: {
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India'
    },
    points: 7840,
    level: 6,
    badges: [
      { name: 'Dedicated', description: 'Consistently active', earnedAt: new Date() }
    ]
  }
];

// Sample report data
const sampleReports = [
  {
    title: 'Illegal Mangrove Cutting at Eastern Coast',
    description: 'Large scale cutting of mangroves observed near the eastern coastal area. Several trees have been cut down and there are signs of machinery being used.',
    category: 'illegal_cutting',
    severity: 'high',
    status: 'under_review',
    location: {
      type: 'Point',
      coordinates: [72.8777, 19.0760],
      address: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India'
      }
    },
    incidentDate: new Date('2023-06-15'),
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?w=400',
        caption: 'Cut mangrove trees',
        verified: false
      }
    ],
    tags: ['illegal-cutting', 'machinery', 'eastern-coast']
  },
  {
    title: 'Chemical Waste Dumping',
    description: 'Industrial waste being dumped in the mangrove area. The water appears discolored and there is a strong chemical smell in the vicinity.',
    category: 'pollution',
    severity: 'critical',
    status: 'escalated',
    location: {
      type: 'Point',
      coordinates: [76.2673, 9.9312],
      address: {
        city: 'Kochi',
        state: 'Kerala',
        country: 'India'
      }
    },
    incidentDate: new Date('2023-07-22'),
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1621472124467-a688f8992ad3?w=400',
        caption: 'Chemical waste in water',
        verified: false
      }
    ],
    tags: ['pollution', 'chemical-waste', 'industrial']
  },
  {
    title: 'Construction Near Protected Mangrove',
    description: 'Construction activity observed very close to protected mangrove area. Debris and construction materials are being placed in the buffer zone.',
    category: 'construction',
    severity: 'medium',
    status: 'validated',
    location: {
      type: 'Point',
      coordinates: [73.8567, 18.5204],
      address: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India'
      }
    },
    incidentDate: new Date('2023-08-05'),
    photos: [
      {
        url: 'https://images.unsplash.com/photo-1621472124503-a760c1146f64?w=400',
        caption: 'Construction near mangroves',
        verified: true
      }
    ],
    tags: ['construction', 'buffer-zone', 'protected-area']
  }
];

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mangrove_watch');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Report.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${user.firstName} ${user.lastName}`);
    }

    // Create reports (assigning them to the first user)
    for (const reportData of sampleReports) {
      const report = new Report({
        ...reportData,
        reporter: createdUsers[0]._id
      });
      await report.save();
      console.log(`Created report: ${report.title}`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();
