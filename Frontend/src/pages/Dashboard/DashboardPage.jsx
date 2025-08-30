import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  Users, 
  Trophy, 
  MapPin, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Sun,
  Moon,
  Calendar,
  Bell,
  BarChart,
  PieChart,
  Map,
  FileText,
  Layers,
  UserCheck,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const DashboardPage = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [timeFilter, setTimeFilter] = useState('month');
  const [regionFilter, setRegionFilter] = useState('all');

  // Fetch data from API (simulated)
  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      const mockStats = [
        { 
          id: 1,
          name: 'Total Reports', 
          value: '1,234', 
          change: '+12%', 
          changeType: 'positive', 
          icon: Shield,
          color: 'primary' 
        },
        { 
          id: 2,
          name: 'Active Users', 
          value: '5,678', 
          change: '+8%', 
          changeType: 'positive', 
          icon: Users,
          color: 'success' 
        },
        { 
          id: 3,
          name: 'Validated Reports', 
          value: '987', 
          change: '+15%', 
          changeType: 'positive', 
          icon: CheckCircle,
          color: 'info' 
        },
        { 
          id: 4,
          name: 'Urgent Cases', 
          value: '23', 
          change: '-5%', 
          changeType: 'negative', 
          icon: AlertTriangle,
          color: 'warning' 
        },
      ];

      const mockReports = [
        { 
          id: 1, 
          title: 'Illegal mangrove cutting detected', 
          status: 'urgent', 
          location: 'Mumbai, India', 
          time: '2 hours ago',
          author: {
            name: 'Raj Kumar',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          category: 'Destruction',
          images: ['https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?ixlib=rb-4.0.3&w=100&fit=crop']
        },
        { 
          id: 2, 
          title: 'Pollution in coastal waters affecting mangroves', 
          status: 'validated', 
          location: 'Chennai, India', 
          time: '4 hours ago',
          author: {
            name: 'Priya Sharma',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
          },
          category: 'Pollution',
          images: ['https://images.unsplash.com/photo-1621472124467-a688f8992ad3?ixlib=rb-4.0.3&w=100&fit=crop']
        },
        { 
          id: 3, 
          title: 'Land reclamation activity near protected mangroves', 
          status: 'investigating', 
          location: 'Kochi, India', 
          time: '6 hours ago',
          author: {
            name: 'Arjun Nair',
            avatar: 'https://randomuser.me/api/portraits/men/75.jpg'
          },
          category: 'Development',
          images: ['https://images.unsplash.com/photo-1621472124503-a760c1146f64?ixlib=rb-4.0.3&w=100&fit=crop']
        },
        { 
          id: 4, 
          title: 'Healthy mangrove regrowth in restoration area', 
          status: 'positive', 
          location: 'Goa, India', 
          time: '1 day ago',
          author: {
            name: 'Leela Menon',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
          },
          category: 'Restoration',
          images: ['https://images.unsplash.com/photo-1594027386703-9543562bccfc?ixlib=rb-4.0.3&w=100&fit=crop']
        },
        { 
          id: 5, 
          title: 'New species identified in mangrove ecosystem', 
          status: 'validated', 
          location: 'Sundarbans, India', 
          time: '2 days ago',
          author: {
            name: 'Dr. Sarah Chen',
            avatar: 'https://randomuser.me/api/portraits/women/79.jpg'
          },
          category: 'Research',
          images: ['https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?ixlib=rb-4.0.3&w=100&fit=crop']
        }
      ];

      const mockActivities = [
        {
          id: 1,
          type: 'report_submitted',
          user: {
            name: 'You',
            avatar: user?.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg'
          },
          content: 'Submitted a new report about mangrove cutting',
          time: '30 minutes ago',
          link: '/reports/123'
        },
        {
          id: 2,
          type: 'report_verified',
          user: {
            name: 'Dr. Anita Desai',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
          },
          content: 'Verified your report about water pollution',
          time: '2 hours ago',
          link: '/reports/122'
        },
        {
          id: 3,
          type: 'achievement',
          user: {
            name: 'System',
            avatar: null
          },
          content: 'You earned the "Environmental Guardian" badge',
          time: '1 day ago',
          link: '/profile/achievements'
        },
        {
          id: 4,
          type: 'comment',
          user: {
            name: 'Vikram Singh',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
          },
          content: 'Commented on your report: "Great observation, I noticed the same issue last week"',
          time: '1 day ago',
          link: '/reports/120#comments'
        },
        {
          id: 5,
          type: 'event_joined',
          user: {
            name: 'You',
            avatar: user?.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg'
          },
          content: 'Joined the Mangrove Cleanup Event',
          time: '2 days ago',
          link: '/community/events/45'
        }
      ];

      const mockEvents = [
        {
          id: 1,
          title: 'Mangrove Cleanup Drive',
          date: '2023-11-26T09:00:00Z',
          location: 'Mumbai Coastal Area',
          attendees: 28,
          isRegistered: true
        },
        {
          id: 2,
          title: 'Conservation Workshop',
          date: '2023-11-29T14:00:00Z',
          location: 'Virtual Event',
          attendees: 45,
          isRegistered: false
        },
        {
          id: 3,
          title: 'Mangrove Photography Walk',
          date: '2023-12-05T07:30:00Z',
          location: 'Sundarbans Reserve',
          attendees: 15,
          isRegistered: false
        }
      ];

      setStatsData(mockStats);
      setRecentReports(mockReports);
      setRecentActivities(mockActivities);
      setUpcomingEvents(mockEvents);
      setIsLoading(false);
    };

    loadData();
  }, [user, timeFilter, regionFilter]);

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getQuickActions = () => {
    const baseActions = [
      { 
        name: 'Submit Report', 
        description: 'Report a mangrove issue or observation',
        href: '/reports/submit', 
        icon: Shield, 
        color: 'bg-primary-500' 
      },
      { 
        name: 'View Reports', 
        description: 'Browse all submitted reports',
        href: '/reports', 
        icon: FileText, 
        color: 'bg-success-500' 
      },
      { 
        name: 'Community', 
        description: 'Connect with other members',
        href: '/community', 
        icon: Users, 
        color: 'bg-indigo-500' 
      },
      { 
        name: 'Leaderboard', 
        description: 'See top contributors',
        href: '/leaderboard', 
        icon: Trophy, 
        color: 'bg-amber-500' 
      },
    ];

    const roleSpecificActions = {
      admin: [
        { 
          name: 'Admin Panel', 
          description: 'Manage users and settings',
          href: '/admin', 
          icon: UserCheck, 
          color: 'bg-purple-500' 
        }
      ],
      government_official: [
        { 
          name: 'Analytics', 
          description: 'View detailed data reports',
          href: '/analytics', 
          icon: BarChart, 
          color: 'bg-blue-500' 
        }
      ],
      researcher: [
        { 
          name: 'Data Export', 
          description: 'Download research datasets',
          href: '/research/export', 
          icon: Layers, 
          color: 'bg-teal-500' 
        }
      ]
    };

    return [
      ...baseActions,
      ...(user?.role && roleSpecificActions[user.role] ? roleSpecificActions[user.role] : [])
    ];
  };

  const quickActions = getQuickActions();

  // Get status classes for reports
  const getStatusClasses = (status) => {
    switch (status) {
      case 'urgent':
        return 'bg-danger-100 text-danger-800 dark:bg-danger-900/30 dark:text-danger-300';
      case 'investigating':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900/30 dark:text-warning-300';
      case 'validated':
        return 'bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300';
      case 'positive':
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'report_submitted':
        return <FileText className="w-5 h-5 text-primary-500" />;
      case 'report_verified':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'achievement':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'comment':
        return <MessageCircle className="w-5 h-5 text-indigo-500" />;
      case 'event_joined':
        return <Calendar className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}! Here's what's happening with mangrove conservation today.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="input-field text-sm py-1.5"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="input-field text-sm py-1.5"
            >
              <option value="all">All Regions</option>
              <option value="north">North Coast</option>
              <option value="south">South Coast</option>
              <option value="east">East Coast</option>
              <option value="west">West Coast</option>
            </select>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statsData.map((stat) => (
                <div key={stat.id} className="card p-6 transition-all hover:shadow-md">
                  <div className="flex items-center">
                    <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                      <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="w-4 h-4 text-success-600 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-danger-600 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      stat.changeType === 'positive' 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-danger-600 dark:text-danger-400'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">from last {timeFilter}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Recent Reports Section */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
                  <Link to="/reports" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View all reports →
                  </Link>
                </div>
                
                <div className="space-y-4">
                  {recentReports.slice(0, 3).map((report) => (
                    <div key={report.id} className="card overflow-hidden transition-all hover:shadow-md">
                      <div className="flex">
                        {report.images && report.images.length > 0 && (
                          <div className="flex-shrink-0 w-24 h-full">
                            <img 
                              src={report.images[0]} 
                              alt={report.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-base font-medium text-gray-900 dark:text-white">{report.title}</h3>
                              <div className="flex items-center mt-1">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(report.status)}`}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </span>
                                <span className="mx-2 text-gray-500">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{report.category}</span>
                                <span className="mx-2 text-gray-500">•</span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{report.time}</span>
                              </div>
                            </div>
                            <Link 
                              to={`/reports/${report.id}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                              Details
                            </Link>
                          </div>
                          
                          <div className="flex items-center mt-3">
                            <div className="flex-shrink-0">
                              <img 
                                src={report.author.avatar} 
                                alt={report.author.name} 
                                className="h-6 w-6 rounded-full"
                              />
                            </div>
                            <div className="ml-2 flex items-center text-xs text-gray-500 dark:text-gray-400">
                              <span>Reported by {report.author.name}</span>
                              <span className="mx-2">•</span>
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {report.location}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Feed */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Activity Feed</h2>
                  <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    View all →
                  </button>
                </div>
                
                <div className="card p-4">
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 py-2">
                        <div className="flex-shrink-0 mt-1">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                              {activity.user.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300 mt-0.5">
                            {activity.content}
                          </p>
                          <Link 
                            to={activity.link} 
                            className="mt-1 text-xs font-medium text-primary-600 hover:text-primary-500"
                          >
                            View details →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <Link
                    key={action.name}
                    to={action.href}
                    className="card p-6 transition-all hover:shadow-md"
                  >
                    <div className="flex items-center">
                      <div className={`${action.color} p-3 rounded-lg`}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{action.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Map Visualization */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Incident Heatmap</h2>
                  <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    Full Screen →
                  </button>
                </div>
                <div className="card p-4 h-80">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-full flex items-center justify-center">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interactive Map</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs mx-auto">
                        View real-time incident locations and heatmap of mangrove threats in your area.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="lg:col-span-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upcoming Events</h2>
                  <Link to="/community/events" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                    All events →
                  </Link>
                </div>
                
                <div className="card">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <h3 className="text-base font-medium text-gray-900 dark:text-white">{event.title}</h3>
                        <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Calendar className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                          {formatDate(event.date)} at {formatTime(event.date)}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                          {event.location}
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <Users className="w-4 h-4 mr-1.5 text-primary-600 dark:text-primary-400" />
                          {event.attendees} attending
                        </div>
                        <div className="mt-3">
                          {event.isRegistered ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900/30 dark:text-success-300">
                              You're Registered
                            </span>
                          ) : (
                            <button className="btn-sm btn-primary w-full">
                              Register Now
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Conservation Trends */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Conservation Trends</h2>
                <button className="text-primary-600 hover:text-primary-500 text-sm font-medium">
                  Detailed Analytics →
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card p-4 h-64">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Mangrove Health Index</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-44 flex items-center justify-center">
                    <BarChart className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
                
                <div className="card p-4 h-64">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-4">Report Categories</h3>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg h-44 flex items-center justify-center">
                    <PieChart className="w-10 h-10 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Custom MessageCircle icon
const MessageCircle = (props) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || props.size || 24}
      height={props.height || props.size || 24}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );
};

export default DashboardPage;
