import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { communityAPI } from '../../services/api';
import { Users, Calendar, FileText, MapPin, Clock, Filter, Search, ExternalLink, BookOpen, Award, Globe, Building } from 'lucide-react';

const CommunityPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [discussions, setDiscussions] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [members, setMembers] = useState([]);
  const [overview, setOverview] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch community overview
        const overviewResponse = await communityAPI.getOverview();
        if (overviewResponse.data.success) {
          setOverview(overviewResponse.data.data.overview);
          setMembers(overviewResponse.data.data.topContributors);
        }

        // Fetch community resources
        const resourcesResponse = await communityAPI.getResources();
        if (resourcesResponse.data.success) {
          setResources(resourcesResponse.data.data.resources);
        }

        // Fetch community events
        const eventsResponse = await communityAPI.getEvents({ upcoming: true });
        if (eventsResponse.data.success) {
          setEvents(eventsResponse.data.data.events);
        }

        // Fetch community forums (discussions)
        const forumsResponse = await communityAPI.getForums();
        if (forumsResponse.data.success) {
          // Get topics from general forum as discussions
          const topicsResponse = await communityAPI.getForumTopics('general');
          if (topicsResponse.data.success) {
            const topics = topicsResponse.data.data.topics;
            // Transform topics to discussion format
            const transformedDiscussions = topics.map(topic => ({
              id: topic.id,
              title: topic.title,
              author: {
                id: topic.authorId,
                name: topic.author,
                avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
                role: 'community_member'
              },
              category: 'discussion',
              content: `Discussion about: ${topic.title}`,
              timestamp: topic.lastReply,
              likes: Math.floor(Math.random() * 50) + 10,
              comments: topic.replies,
              views: topic.views,
              tags: ['community', 'discussion']
            }));
            setDiscussions(transformedDiscussions);
          }
        }

      } catch (err) {
        console.error('Error fetching community data:', err);
        setError('Failed to load community data. Please try again later.');
      } finally {
      setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, selectedRegion]);

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      'restoration': '🌱',
      'threats': '⚠️',
      'education': '📚',
      'research': '🔬',
      'events': '🎉',
      'discussion': '💬',
      'guide': '📖',
      'inspiration': '✨',
      'legal': '⚖️'
    };
    return categoryIcons[category] || '📋';
  };

  const getResourceTypeIcon = (type) => {
    const typeIcons = {
      'pdf': '📄',
      'article': '📝',
      'tutorial': '🎥',
      'case-study': '📊',
      'reference': '📚'
    };
    return typeIcons[type] || '📄';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'beginner': 'bg-green-100 text-green-800',
      'intermediate': 'bg-yellow-100 text-yellow-800',
      'advanced': 'bg-red-100 text-red-800',
      'all': 'bg-blue-100 text-blue-800'
    };
    return colors[difficulty] || colors.beginner;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  const handleEventRegistration = async (eventId) => {
    try {
      const response = await communityAPI.registerEvent(eventId);
      if (response.data.success) {
        // Update the event to show as registered
        setEvents(prev => prev.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: true, currentParticipants: event.currentParticipants + 1 }
            : event
        ));
        alert('Successfully registered for the event!');
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      alert('Failed to register for event. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Community</h2>
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
            <Users className="h-12 w-12 text-blue-500 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Community Hub</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with fellow mangrove conservationists, share knowledge, and participate in community activities
            </p>
          </div>
          
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {overview.totalUsers?.toLocaleString() || '0'}
            </div>
            <div className="text-gray-600">Active Members</div>
            </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {overview.totalReports?.toLocaleString() || '0'}
          </div>
            <div className="text-gray-600">Reports Submitted</div>
        </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {overview.activeCommunities || '0'}
            </div>
            <div className="text-gray-600">Active Communities</div>
        </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {overview.totalMangroveAreas || '0'}
            </div>
            <div className="text-gray-600">Mangrove Areas</div>
          </div>
          </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
                    <select
                      value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Categories</option>
                      <option value="restoration">Restoration</option>
                <option value="threats">Threats</option>
                <option value="education">Education</option>
                      <option value="research">Research</option>
                      <option value="events">Events</option>
                    </select>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-gray-400" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                <option value="north">North Coast</option>
                <option value="south">South Coast</option>
                <option value="east">East Coast</option>
                <option value="west">West Coast</option>
              </select>
            </div>
          </div>
                  </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Discussions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Recent Discussions</h2>
                <p className="text-sm text-gray-600 mt-1">Join conversations about mangrove conservation</p>
                </div>
                
              <div className="p-6">
                {discussions.length > 0 ? (
                <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <div key={discussion.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                          <img 
                            src={discussion.author.avatar} 
                            alt={discussion.author.name} 
                              className="h-10 w-10 rounded-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="text-sm font-medium text-gray-900">
                              {discussion.title}
                            </h3>
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(discussion.timestamp)}
                            </span>
                          </div>
                            <p className="text-sm text-gray-600 mb-2">
                              by {discussion.author.name} • {discussion.author.role.replace('_', ' ')}
                          </p>
                            <p className="text-sm text-gray-700 mb-3">
                            {discussion.content}
                          </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <span className="mr-1">👍</span>
                                  {discussion.likes}
                                </span>
                                <span className="flex items-center">
                                  <span className="mr-1">💬</span>
                                  {discussion.comments}
                                </span>
                                <span className="flex items-center">
                                  <span className="mr-1">👁️</span>
                                  {discussion.views}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                            {discussion.tags.map((tag, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                  >
                                    {tag}
                              </span>
                            ))}
                          </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                    </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-4">💬</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No discussions yet</h3>
                    <p className="text-gray-500">Be the first to start a conversation!</p>
              </div>
            )}

                <div className="mt-6">
                  <a
                    href="/community/forums"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all discussions →
                  </a>
                </div>
              </div>
            </div>
                  </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Upcoming Events</h3>
                <p className="text-sm text-gray-600 mt-1">Join community activities and workshops</p>
                </div>

              <div className="p-6">
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">{event.title}</h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(event.date)}
                        </span>
                      </div>
                        <p className="text-sm text-gray-600 mb-3">{event.description}</p>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                    </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {event.currentParticipants}/{event.maxParticipants} attending
                          </span>
                          <button
                            onClick={() => handleEventRegistration(event.id)}
                            disabled={event.isRegistered}
                            className={`text-xs px-3 py-1 rounded-full ${
                              event.isRegistered
                                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                                : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            }`}
                          >
                            {event.isRegistered ? 'Registered' : 'Register'}
                          </button>
                        </div>
                      </div>
                    ))}
                    </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="text-gray-400 text-3xl mb-2">📅</div>
                    <p className="text-gray-500 text-sm">No upcoming events</p>
                  </div>
                )}

                <div className="mt-4">
                  <a
                    href="/community/events"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all events →
                  </a>
                        </div>
                      </div>
                        </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Contributors</h3>
                <p className="text-sm text-gray-600 mt-1">Community leaders and active members</p>
                        </div>
              
              <div className="p-6">
                {members.length > 0 ? (
                  <div className="space-y-4">
                    {members.slice(0, 5).map((member) => (
                      <div key={member._id} className="flex items-center space-x-3">
                        <img
                          src={member.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'}
                          alt={`${member.firstName} ${member.lastName}`}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {member.role.replace('_', ' ')} • {member.points} points
                          </p>
                      </div>
                    </div>
                  ))}
                </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm">No contributors found</p>
                  </div>
                )}
              </div>
            </div>
                </div>
              </div>

        {/* Resources Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Educational Resources</h2>
            <p className="text-sm text-gray-600 mt-1">Learn about mangrove conservation and best practices</p>
                </div>

          <div className="p-6">
            {resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource) => (
                  <div key={resource.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">{getResourceTypeIcon(resource.type)}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 mb-1">
                          {resource.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">
                            {resource.estimatedTime}
                          </span>
                        </div>
                        <div className="mt-3">
                          <a
                            href={resource.url}
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <BookOpen className="h-3 w-3 mr-1" />
                            Read More
                          </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resources available</h3>
                <p className="text-gray-500">Check back later for educational content</p>
              </div>
            )}
                  </div>
                </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Connect with fellow conservationists, share your experiences, and contribute to mangrove protection efforts
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/reports/submit"
              className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Submit a Report
            </a>
            <a
              href="/community/events"
              className="border-2 border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Join an Event
            </a>
                </div>
              </div>
      </div>
    </div>
  );
};

export default CommunityPage;
