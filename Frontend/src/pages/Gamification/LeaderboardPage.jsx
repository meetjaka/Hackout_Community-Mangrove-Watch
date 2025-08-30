import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trophy, Award, Users, Clock, Filter, Calendar, Map, Shield, Star } from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [timeFilter, setTimeFilter] = useState('month');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [achievements, setAchievements] = useState([]);

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      const mockLeaderboardData = [
        {
          id: 1,
          rank: 1,
          name: 'Sarah Johnson',
          role: 'marine_biologist',
          avatarUrl: 'https://randomuser.me/api/portraits/women/44.jpg',
          points: 9850,
          reportsSubmitted: 67,
          issuesResolved: 42,
          streak: 24,
          badges: ['Expert', 'Conservationist', 'Educator'],
          region: 'South Coast'
        },
        {
          id: 2,
          rank: 2,
          name: 'Ahmed Hassan',
          role: 'fisherman',
          avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
          points: 8720,
          reportsSubmitted: 58,
          issuesResolved: 35,
          streak: 18,
          badges: ['Veteran', 'Guardian'],
          region: 'East Coast'
        },
        {
          id: 3,
          rank: 3,
          name: 'Maria Rodriguez',
          role: 'coastal_resident',
          avatarUrl: 'https://randomuser.me/api/portraits/women/68.jpg',
          points: 7840,
          reportsSubmitted: 51,
          issuesResolved: 29,
          streak: 30,
          badges: ['Dedicated', 'Community Leader'],
          region: 'North Coast'
        },
        {
          id: 4,
          rank: 4,
          name: 'John Smith',
          role: 'environmental_officer',
          avatarUrl: 'https://randomuser.me/api/portraits/men/75.jpg',
          points: 6950,
          reportsSubmitted: 45,
          issuesResolved: 38,
          streak: 14,
          badges: ['Analyst', 'Problem Solver'],
          region: 'West Coast'
        },
        {
          id: 5,
          rank: 5,
          name: 'Li Wei',
          role: 'student',
          avatarUrl: 'https://randomuser.me/api/portraits/women/79.jpg',
          points: 5830,
          reportsSubmitted: 39,
          issuesResolved: 22,
          streak: 21,
          badges: ['Rising Star', 'Enthusiast'],
          region: 'South Coast'
        },
        {
          id: 6,
          rank: 6,
          name: 'Michael Brown',
          role: 'environmental_activist',
          avatarUrl: 'https://randomuser.me/api/portraits/men/18.jpg',
          points: 4920,
          reportsSubmitted: 34,
          issuesResolved: 19,
          streak: 9,
          badges: ['Advocate', 'Educator'],
          region: 'East Coast'
        },
        {
          id: 7,
          rank: 7,
          name: 'Priya Patel',
          role: 'coastal_resident',
          avatarUrl: 'https://randomuser.me/api/portraits/women/63.jpg',
          points: 4350,
          reportsSubmitted: 28,
          issuesResolved: 15,
          streak: 13,
          badges: ['Observer', 'Community Builder'],
          region: 'North Coast'
        },
        {
          id: 8,
          rank: 8,
          name: 'James Wilson',
          role: 'fisherman',
          avatarUrl: 'https://randomuser.me/api/portraits/men/41.jpg',
          points: 3780,
          reportsSubmitted: 25,
          issuesResolved: 11,
          streak: 8,
          badges: ['Contributor'],
          region: 'West Coast'
        },
        {
          id: 9,
          rank: 9,
          name: 'Emma Clark',
          role: 'student',
          avatarUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
          points: 3250,
          reportsSubmitted: 21,
          issuesResolved: 8,
          streak: 11,
          badges: ['Newcomer'],
          region: 'South Coast'
        },
        {
          id: 10,
          rank: 10,
          name: 'Omar Farooq',
          role: 'marine_biologist',
          avatarUrl: 'https://randomuser.me/api/portraits/men/55.jpg',
          points: 2840,
          reportsSubmitted: 19,
          issuesResolved: 12,
          streak: 6,
          badges: ['Scientist', 'Researcher'],
          region: 'East Coast'
        }
      ];

      // Mock user ranking (could be the actual user)
      const mockUserRanking = {
        id: user?.id || 'current-user',
        rank: 15,
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'Current User',
        role: user?.role || 'community_member',
        avatarUrl: user?.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg',
        points: 1850,
        reportsSubmitted: 12,
        issuesResolved: 7,
        streak: 5,
        badges: ['Active Participant'],
        region: 'Central Coast'
      };

      // Mock achievements
      const mockAchievements = [
        {
          id: 1,
          name: 'First Report',
          description: 'Submit your first mangrove observation report',
          icon: 'award',
          points: 100,
          isCompleted: true,
          completedDate: '2023-05-15'
        },
        {
          id: 2,
          name: 'Weekly Streak',
          description: 'Submit reports for 7 consecutive days',
          icon: 'clock',
          points: 250,
          isCompleted: false,
          progress: 5,
          total: 7
        },
        {
          id: 3,
          name: 'Verification Pro',
          description: 'Have 10 of your reports verified by experts',
          icon: 'shield',
          points: 500,
          isCompleted: false,
          progress: 7,
          total: 10
        },
        {
          id: 4,
          name: 'Community Educator',
          description: 'Share 5 educational posts about mangrove conservation',
          icon: 'users',
          points: 350,
          isCompleted: true,
          completedDate: '2023-06-02'
        },
        {
          id: 5,
          name: 'Conservation Champion',
          description: 'Participate in a mangrove cleanup or restoration event',
          icon: 'map',
          points: 750,
          isCompleted: false,
          progress: 0,
          total: 1
        },
        {
          id: 6,
          name: 'Photo Expert',
          description: 'Submit 20 high-quality photos with your reports',
          icon: 'camera',
          points: 400,
          isCompleted: false,
          progress: 12,
          total: 20
        }
      ];

      setLeaderboardData(mockLeaderboardData);
      setUserRanking(mockUserRanking);
      setAchievements(mockAchievements);
      setIsLoading(false);
    }, 1000);
  }, [user, timeFilter, categoryFilter, regionFilter]);

  // Get the appropriate icon for achievement
  const getAchievementIcon = (iconName) => {
    switch (iconName) {
      case 'award':
        return <Award className="w-6 h-6" />;
      case 'clock':
        return <Clock className="w-6 h-6" />;
      case 'users':
        return <Users className="w-6 h-6" />;
      case 'map':
        return <Map className="w-6 h-6" />;
      case 'shield':
        return <Shield className="w-6 h-6" />;
      case 'camera':
        return <Star className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Leaderboard</h1>
            <p className="text-gray-600 dark:text-gray-400">
              See top contributors and compete for conservation achievements
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
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field text-sm py-1.5"
            >
              <option value="all">All Categories</option>
              <option value="reports">Most Reports</option>
              <option value="resolved">Issues Resolved</option>
              <option value="streak">Longest Streak</option>
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
              <option value="central">Central Coast</option>
            </select>
          </div>
        </div>

        {/* User Current Ranking Card */}
        {userRanking && (
          <div className="card p-6 mb-8 border-2 border-primary-500 dark:border-primary-400">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="shrink-0 relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-primary-100 dark:border-primary-900 bg-primary-50 dark:bg-primary-950">
                  <img 
                    src={userRanking.avatarUrl} 
                    alt={userRanking.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold border-2 border-white dark:border-gray-800">
                  #{userRanking.rank}
                </div>
              </div>
              
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userRanking.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mb-2">
                  {userRanking.role.replace('_', ' ')} • {userRanking.region}
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {userRanking.badges.map((badge, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                      {badge}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">{userRanking.points.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">POINTS</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">{userRanking.reportsSubmitted}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">REPORTS</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{userRanking.issuesResolved}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">RESOLVED</div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{userRanking.streak}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">STREAK</div>
                  </div>
                </div>
              </div>
              
              <div className="shrink-0 flex flex-col items-center space-y-2 p-4 bg-primary-50 dark:bg-primary-950 rounded-lg">
                <Trophy className="w-12 h-12 text-primary-500" />
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Next Milestone</div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">2,000 Points</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
                    <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">150 points to go</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="card overflow-hidden">
              <div className="bg-primary-50 dark:bg-primary-950 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Trophy className="w-5 h-5 mr-2 text-primary-600" />
                  Top Contributors
                </h2>
              </div>
              
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Rank
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Points
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Reports
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Resolved
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Streak
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {leaderboardData.map((user, index) => (
                        <tr key={user.id} className={`${index < 3 ? 'bg-primary-50 dark:bg-primary-950/30' : ''} hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className={`
                                flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full
                                ${index === 0 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' : 
                                  index === 1 ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : 
                                  index === 2 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-300' : 
                                  'bg-gray-50 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
                              `}>
                                {index === 0 ? (
                                  <Trophy className="w-4 h-4" />
                                ) : (
                                  <span className="text-sm font-bold">{user.rank}</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-full" src={user.avatarUrl} alt={user.name} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {user.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                  {user.role.replace('_', ' ')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-primary-600 dark:text-primary-400">{user.points.toLocaleString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{user.reportsSubmitted}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{user.issuesResolved}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{user.streak} days</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {!isLoading && (
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 text-sm font-medium">
                    View All Rankings
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Achievements Section */}
          <div className="lg:col-span-1">
            <div className="card overflow-hidden">
              <div className="bg-primary-50 dark:bg-primary-950 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Award className="w-5 h-5 mr-2 text-primary-600" />
                  Your Achievements
                </h2>
              </div>
              
              {isLoading ? (
                <div className="p-8 flex justify-center">
                  <LoadingSpinner size="lg" />
                </div>
              ) : (
                <div className="p-6 space-y-6">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className={`flex items-start space-x-4 p-4 rounded-lg ${
                      achievement.isCompleted 
                        ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900' 
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                    }`}>
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                        achievement.isCompleted 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {getAchievementIcon(achievement.icon)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                            {achievement.name}
                            {achievement.isCompleted && (
                              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                                Completed
                              </span>
                            )}
                          </h3>
                          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
                            {achievement.points} pts
                          </span>
                        </div>
                        
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {achievement.description}
                        </p>
                        
                        {achievement.isCompleted ? (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Completed on {new Date(achievement.completedDate).toLocaleDateString()}
                          </p>
                        ) : (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-500 dark:text-gray-400">Progress</span>
                              <span className="text-gray-700 dark:text-gray-300">{achievement.progress} / {achievement.total}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                              <div 
                                className="bg-primary-600 h-1.5 rounded-full" 
                                style={{ width: `${(achievement.progress / achievement.total) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  <div className="text-center pt-4">
                    <button className="btn-outline-primary text-sm">
                      View All Achievements
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Rewards Panel */}
            <div className="card overflow-hidden mt-8">
              <div className="bg-primary-50 dark:bg-primary-950 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-primary-600" />
                  Available Rewards
                </h2>
              </div>
              
              <div className="p-6">
                <div className="text-center text-gray-600 dark:text-gray-400 py-4">
                  <p>Earn points by submitting reports and completing achievements to unlock special rewards!</p>
                  
                  <div className="mt-6 grid grid-cols-1 gap-4">
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-2 py-1">
                        5,000 pts
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">Community Conservation Workshop</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Free entry to an exclusive workshop on mangrove conservation techniques</p>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-2 py-1">
                        10,000 pts
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">Limited Edition T-Shirt</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Exclusive Community Mangrove Watch t-shirt with your name as a top contributor</p>
                    </div>
                    
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-2 py-1">
                        25,000 pts
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-4">Mangrove Planting Ceremony</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Plant a mangrove tree with your name in a protected area</p>
                    </div>
                  </div>
                  
                  <button className="btn-outline-primary text-sm mt-6">
                    View All Rewards
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// This is a custom Gift icon component
const Gift = (props) => {
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
      <polyline points="20 12 20 22 4 22 4 12"></polyline>
      <rect x="2" y="7" width="20" height="5"></rect>
      <line x1="12" y1="22" x2="12" y2="7"></line>
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
    </svg>
  );
};

export default LeaderboardPage;
