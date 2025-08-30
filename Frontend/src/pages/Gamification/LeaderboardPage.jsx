import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { gamificationAPI } from '../../services/api';
import { Trophy, Award, TrendingUp, MapPin, Users, Filter, Search, Star, Target, Clock } from 'lucide-react';

const LeaderboardPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRanking, setUserRanking] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch leaderboard data
        const leaderboardResponse = await gamificationAPI.getLeaderboard({
          region: regionFilter !== 'all' ? regionFilter : undefined,
          period: timeFilter !== 'all' ? timeFilter : undefined,
          limit: 20
        });

        if (leaderboardResponse.data.success) {
          setLeaderboardData(leaderboardResponse.data.data.leaderboard);
          
          // Find current user's ranking
          const currentUserRank = leaderboardResponse.data.data.leaderboard.find(
            entry => entry._id === user?.id
          );
          
          if (currentUserRank) {
            setUserRanking(currentUserRank);
          } else {
            // If user is not in top 20, create a placeholder ranking
            setUserRanking({
              _id: user?.id || 'current-user',
              rank: '>20',
              firstName: user?.firstName || 'Current',
              lastName: user?.lastName || 'User',
        role: user?.role || 'community_member',
              avatar: user?.profileImage || 'https://randomuser.me/api/portraits/lego/1.jpg',
              points: user?.points || 0,
              level: user?.level || 1,
              badges: user?.badges || [],
              location: user?.location?.address?.state || 'Unknown'
            });
          }
        }

        // Fetch achievements
        const achievementsResponse = await gamificationAPI.getAchievements();
        if (achievementsResponse.data.success) {
          setAchievements(achievementsResponse.data.data.achievements);
        }

      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
        setError('Failed to load leaderboard data. Please try again later.');
      } finally {
      setIsLoading(false);
      }
    };

    fetchData();
  }, [user, timeFilter, categoryFilter, regionFilter]);

  const getRoleDisplayName = (role) => {
    if (!role) return 'User'; // Handle undefined or null roles
    
    const roleNames = {
      'marine_biologist': 'Marine Biologist',
      'fisherman': 'Fisherman',
      'coastal_resident': 'Coastal Resident',
      'environmental_officer': 'Environmental Officer',
      'researcher': 'Researcher',
      'ngo_admin': 'NGO Admin',
      'government_officer': 'Government Officer',
      'citizen_scientist': 'Citizen Scientist',
      'local_guide': 'Local Guide',
      'public_visitor': 'Public Visitor'
    };
    return roleNames[role] || role.replace('_', ' ').charAt(0).toUpperCase() + role.replace('_', ' ').slice(1);
  };

  const getRoleIcon = (role) => {
    const roleIcons = {
      'marine_biologist': '🔬',
      'fisherman': '🎣',
      'coastal_resident': '🏠',
      'environmental_officer': '👮',
      'researcher': '📚',
      'ngo_admin': '🏢',
      'government_officer': '🏛️',
      'citizen_scientist': '🔍',
      'local_guide': '🗺️',
      'public_visitor': '👤'
    };
    return roleIcons[role] || '👤';
  };

  const getBadgeIcon = (badgeName) => {
    const badgeIcons = {
      'Expert': '🏆',
      'Conservationist': '🌱',
      'Educator': '📚',
      'Veteran': '⭐',
      'Guardian': '🛡️',
      'Dedicated': '💪',
      'Community Leader': '👑',
      'Analyst': '📊',
      'Problem Solver': '🔧',
      'Newcomer': '🆕',
      'Scientist': '🔬',
      'Researcher': '📖',
      'Active Participant': '🎯'
    };
    return badgeIcons[badgeName] || '🏅';
  };

  const getTimeFilterLabel = (filter) => {
    const labels = {
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
      'all': 'All Time'
    };
    return labels[filter] || filter;
  };

  const getRegionFilterLabel = (filter) => {
    const labels = {
      'north': 'North Coast',
      'south': 'South Coast',
      'east': 'East Coast',
      'west': 'West Coast',
      'all': 'All Regions'
    };
    return labels[filter] || filter;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Leaderboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="h-12 w-12 text-yellow-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Community Leaderboard</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Celebrate the top contributors and conservation champions in our mangrove watch community
            </p>
          </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
            </select>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Regions</option>
              <option value="north">North Coast</option>
              <option value="south">South Coast</option>
              <option value="east">East Coast</option>
              <option value="west">West Coast</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="reports">Reports</option>
                <option value="verification">Verification</option>
                <option value="community">Community</option>
                <option value="education">Education</option>
            </select>
          </div>
        </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Showing {getTimeFilterLabel(timeFilter)} • {getRegionFilterLabel(regionFilter)}
            </p>
                </div>
              </div>
              
        {/* Current User Ranking */}
        {userRanking && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <img
                    src={userRanking.avatar}
                    alt={`${userRanking.firstName} ${userRanking.lastName}`}
                    className="h-16 w-16 rounded-full border-4 border-white"
                  />
                  {userRanking.rank === 1 && (
                    <div className="absolute -top-2 -right-2">
                      <Trophy className="h-6 w-6 text-yellow-300" />
                </div>
                  )}
                  </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {userRanking.firstName} {userRanking.lastName}
                  </h3>
                  <p className="text-blue-100">
                    {getRoleIcon(userRanking.role)} {getRoleDisplayName(userRanking.role)}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-blue-100">Rank #{userRanking.rank}</span>
                    <span className="text-sm text-blue-100">•</span>
                    <span className="text-sm text-blue-100">{userRanking.points} points</span>
                    <span className="text-sm text-blue-100">•</span>
                    <span className="text-sm text-blue-100">Level {userRanking.level}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{userRanking.points}</div>
                <div className="text-blue-100">Total Points</div>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Top Contributors</h2>
              </div>
              
          <div className="divide-y divide-gray-200">
            {leaderboardData.map((entry, index) => (
              <div key={entry._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Rank */}
                    <div className="flex-shrink-0">
                      {index === 0 && (
                        <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                        </div>
                      )}
                      {index === 1 && (
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-gray-600" />
                        </div>
                      )}
                      {index === 2 && (
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <Award className="h-6 w-6 text-orange-600" />
                        </div>
                      )}
                      {index > 2 && (
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                </div>
                                )}
                              </div>

                    {/* User Info */}
                    <div className="flex items-center space-x-4">
                      <img
                        src={entry.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                        alt={`${entry.firstName} ${entry.lastName}`}
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {entry.firstName} {entry.lastName}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{getRoleIcon(entry.role)} {getRoleDisplayName(entry.role)}</span>
                          <span>•</span>
                          <span>{entry.location?.address?.state || 'Unknown Region'}</span>
                            </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-gray-500">Level {entry.level}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{entry.badges?.length || 0} badges</span>
                                </div>
                                </div>
                              </div>
                            </div>

                  {/* Points and Stats */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{entry.points}</div>
                    <div className="text-sm text-gray-500">points</div>
                  </div>
                </div>

                {/* Badges */}
                {entry.badges && entry.badges.length > 0 && (
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Badges:</span>
                    {entry.badges.slice(0, 5).map((badge, badgeIndex) => (
                      <div
                        key={badgeIndex}
                        className="flex items-center space-x-1 px-2 py-1 bg-gray-100 rounded-full text-xs"
                        title={badge.name}
                      >
                        <span>{getBadgeIcon(badge.name)}</span>
                        <span className="text-gray-700">{badge.name}</span>
                      </div>
                    ))}
                    {entry.badges.length > 5 && (
                      <span className="text-xs text-gray-500">+{entry.badges.length - 5} more</span>
                    )}
                </div>
              )}
              </div>
            ))}
            </div>
          </div>

          {/* Achievements Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Achievements</h2>
            <p className="text-sm text-gray-600 mt-1">Track your progress and unlock new badges</p>
              </div>
              
          <div className="p-6">
            {achievements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${
                      achievement.progress >= achievement.maxProgress
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        achievement.progress >= achievement.maxProgress
                          ? 'bg-green-100 text-green-600'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className="text-2xl">{achievement.icon}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{achievement.name}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                          <div className="mt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>{achievement.progress}/{achievement.maxProgress}</span>
                            </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                achievement.progress >= achievement.maxProgress
                                  ? 'bg-green-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{
                                width: `${Math.min((achievement.progress / achievement.maxProgress) * 100, 100)}%`
                              }}
                              ></div>
                            </div>
                        </div>
                        {achievement.progress >= achievement.maxProgress && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            ✓ Completed! {achievement.reward}
                          </div>
                        )}
                      </div>
                      </div>
                    </div>
                  ))}
                  </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                <p className="text-gray-500">
                  Start contributing to unlock achievements and earn badges!
                </p>
                </div>
              )}
            </div>
              </div>
              
        {/* Community Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {leaderboardData.length}
                      </div>
            <div className="text-gray-600">Active Contributors</div>
                    </div>
                    
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {leaderboardData.reduce((total, entry) => total + entry.points, 0).toLocaleString()}
                      </div>
            <div className="text-gray-600">Total Points Earned</div>
                    </div>
                    
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {leaderboardData.reduce((total, entry) => total + (entry.badges?.length || 0), 0)}
                      </div>
            <div className="text-gray-600">Badges Awarded</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
