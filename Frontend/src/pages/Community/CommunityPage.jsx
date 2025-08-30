import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, MessageSquare, Calendar, BookOpen, MapPin, ThumbsUp, 
  MessageCircle, Share2, Bookmark, Eye, Search, Filter, ChevronRight, 
  Plus, User, Clock
} from 'lucide-react';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const CommunityPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discussions');
  const [discussions, setDiscussions] = useState([]);
  const [events, setEvents] = useState([]);
  const [resources, setResources] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      // Mock discussions
      const mockDiscussions = [
        {
          id: 1,
          title: 'Mangrove restoration techniques for degraded coastlines',
          author: {
            id: 101,
            name: 'Dr. Sarah Chen',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            role: 'marine_biologist'
          },
          category: 'restoration',
          content: "I've been experimenting with different restoration techniques in the eastern coastal region. Has anyone tried the Riley Method for degraded mangroves with high salinity?",
          timestamp: '2023-11-05T14:23:00Z',
          likes: 42,
          comments: 18,
          views: 156,
          tags: ['restoration', 'techniques', 'high-salinity']
        },
        {
          id: 2,
          title: 'Concerning pollution levels near the Southern Harbor mangroves',
          author: {
            id: 102,
            name: 'Michael Torres',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            role: 'fisherman'
          },
          category: 'threats',
          content: "I've noticed increasing amounts of plastic waste and oil slicks near the Southern Harbor mangroves. This area used to be pristine just 2 years ago. Anyone else observing similar issues?",
          timestamp: '2023-11-08T09:15:00Z',
          likes: 37,
          comments: 24,
          views: 189,
          tags: ['pollution', 'plastics', 'southern-harbor']
        },
        {
          id: 3,
          title: 'Community cleanup event - Looking for volunteers',
          author: {
            id: 103,
            name: 'Aisha Patel',
            avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
            role: 'environmental_activist'
          },
          category: 'events',
          content: "We're organizing a major cleanup effort at Coral Bay mangroves on November 25th. We need at least 30 volunteers. Equipment will be provided, just bring water and sun protection!",
          timestamp: '2023-11-10T16:45:00Z',
          likes: 53,
          comments: 29,
          views: 212,
          tags: ['cleanup', 'volunteer', 'coral-bay']
        },
        {
          id: 4,
          title: 'New educational materials for school programs',
          author: {
            id: 104,
            name: 'Professor James Wilson',
            avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
            role: 'educator'
          },
          category: 'education',
          content: 'Our university just published a series of free educational materials for K-12 classrooms about mangrove ecosystems. Would love feedback from educators who try these resources.',
          timestamp: '2023-11-12T11:30:00Z',
          likes: 29,
          comments: 12,
          views: 134,
          tags: ['education', 'resources', 'schools']
        },
        {
          id: 5,
          title: 'Changes in crab populations after recent storm',
          author: {
            id: 105,
            name: 'Dr. Emily Rodriguez',
            avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
            role: 'researcher'
          },
          category: 'research',
          content: "I'm conducting a rapid assessment of how the recent tropical storm affected crab populations in the western mangroves. Early observations show significant changes in distribution patterns.",
          timestamp: '2023-11-14T08:20:00Z',
          likes: 31,
          comments: 16,
          views: 148,
          tags: ['research', 'crabs', 'storm-impact']
        }
      ];
      
      // Mock events
      const mockEvents = [
        {
          id: 1,
          title: 'World Mangrove Day Community Celebration',
          organizer: 'Coastal Conservation Alliance',
          date: '2023-11-26T10:00:00Z',
          endDate: '2023-11-26T16:00:00Z',
          location: 'Central Beach Pavilion',
          description: 'Join us for a day of education, celebration, and action as we mark World Mangrove Day with interactive exhibits, expert talks, and family activities.',
          image: 'https://images.unsplash.com/photo-1626668893632-6f3a4466d22f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fG1hbmdyb3ZlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
          attendees: 86,
          category: 'celebration',
          isFeatured: true
        },
        {
          id: 2,
          title: 'Mangrove Restoration Workshop',
          organizer: 'ReGreen Initiative',
          date: '2023-12-05T09:00:00Z',
          endDate: '2023-12-05T15:00:00Z',
          location: 'Eastern Mangrove Sanctuary',
          description: 'A hands-on workshop teaching practical skills for mangrove restoration. Learn proper planting techniques, site selection, and monitoring methods.',
          image: 'https://images.unsplash.com/photo-1621472124503-a760c1146f64?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8bWFuZ3JvdmV8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
          attendees: 42,
          category: 'workshop'
        },
        {
          id: 3,
          title: 'Monthly Coastal Cleanup',
          organizer: 'Clean Shores Initiative',
          date: '2023-11-18T08:00:00Z',
          endDate: '2023-11-18T12:00:00Z',
          location: 'Southern Harbor Mangroves',
          description: 'Our monthly cleanup event focusing on removing plastic waste and debris from the Southern Harbor mangrove ecosystem.',
          image: 'https://images.unsplash.com/photo-1592035659284-3debfa2fd9d7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjB8fGJlYWNoJTIwY2xlYW51cHxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
          attendees: 28,
          category: 'cleanup'
        },
        {
          id: 4,
          title: 'Mangrove Photography Exhibition',
          organizer: 'Arts for Nature Collective',
          date: '2023-12-15T18:00:00Z',
          endDate: '2023-12-20T20:00:00Z',
          location: 'City Gallery',
          description: 'A week-long exhibition featuring stunning photography of mangrove ecosystems from around the region. Opening reception on December 15th.',
          image: 'https://images.unsplash.com/photo-1519400197429-404ae25c222c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OXx8cGhvdG9ncmFwaHklMjBleGhpYml0aW9ufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
          attendees: 104,
          category: 'cultural'
        },
        {
          id: 5,
          title: 'Citizen Science Training: Mangrove Monitoring',
          organizer: 'Marine Research Institute',
          date: '2023-12-08T13:00:00Z',
          endDate: '2023-12-08T17:00:00Z',
          location: 'North Coast Research Center',
          description: 'Learn how to participate in our ongoing citizen science program monitoring mangrove health and biodiversity.',
          image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fHJlc2VhcmNofGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
          attendees: 35,
          category: 'training'
        }
      ];
      
      // Mock resources
      const mockResources = [
        {
          id: 1,
          title: 'Complete Guide to Mangrove Species Identification',
          type: 'pdf',
          author: 'Marine Conservation Institute',
          description: 'A comprehensive field guide to identifying all major mangrove species in the region, with detailed illustrations and key characteristics.',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1590856029826-c7a73142bbf1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fG1hbmdyb3ZlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
          downloads: 487,
          category: 'guide'
        },
        {
          id: 2,
          title: 'Mangrove Monitoring Protocol',
          type: 'pdf',
          author: 'National Environmental Agency',
          description: 'Standard protocol for monitoring mangrove health and biodiversity, designed for citizen scientists and community volunteers.',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1621472124467-a688f8992ad3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjd8fG1hbmdyb3ZlfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
          downloads: 352,
          category: 'protocol'
        },
        {
          id: 3,
          title: 'Mangroves & Climate Change: Research Summary',
          type: 'pdf',
          author: 'Climate Research Consortium',
          description: 'A summary of the latest research on how climate change is affecting mangrove ecosystems and their carbon sequestration capabilities.',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1440342359743-84fcb8c21f21?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTB8fGNsaW1hdGUlMjBjaGFuZ2V8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
          downloads: 621,
          category: 'research'
        },
        {
          id: 4,
          title: 'Community-Based Mangrove Restoration Handbook',
          type: 'pdf',
          author: 'Global Restoration Network',
          description: 'Step-by-step guidance for communities to plan and implement successful mangrove restoration projects with limited resources.',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1535913989690-f90e1c2d4cfa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8cmVzdG9yYXRpb258ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
          downloads: 739,
          category: 'guide'
        },
        {
          id: 5,
          title: 'Educational Video Series: Mangrove Ecosystems',
          type: 'video',
          author: 'Ocean Education Initiative',
          description: 'A series of 10 short educational videos explaining mangrove ecology, importance, and conservation, suitable for schools and general public.',
          url: '#',
          thumbnail: 'https://images.unsplash.com/photo-1617419086540-518c5b847b88?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8M3x8dmlkZW8lMjBzZXJpZXN8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
          downloads: 1243,
          category: 'education'
        }
      ];
      
      // Mock community members
      const mockMembers = [
        {
          id: 101,
          name: 'Dr. Sarah Chen',
          avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
          role: 'marine_biologist',
          location: 'Eastern Coast',
          joinDate: '2022-04-15T00:00:00Z',
          contributions: 83,
          expertise: ['Species identification', 'Restoration ecology', 'Water quality']
        },
        {
          id: 102,
          name: 'Michael Torres',
          avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
          role: 'fisherman',
          location: 'Southern Harbor',
          joinDate: '2022-06-23T00:00:00Z',
          contributions: 67,
          expertise: ['Local ecosystems', 'Fishing impacts', 'Traditional knowledge']
        },
        {
          id: 103,
          name: 'Aisha Patel',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
          role: 'environmental_activist',
          location: 'Central Coast',
          joinDate: '2022-03-10T00:00:00Z',
          contributions: 95,
          expertise: ['Community organization', 'Policy advocacy', 'Education']
        },
        {
          id: 104,
          name: 'Professor James Wilson',
          avatar: 'https://randomuser.me/api/portraits/men/75.jpg',
          role: 'educator',
          location: 'Northern Region',
          joinDate: '2022-08-05T00:00:00Z',
          contributions: 41,
          expertise: ['Educational materials', 'Youth engagement', 'Research']
        },
        {
          id: 105,
          name: 'Dr. Emily Rodriguez',
          avatar: 'https://randomuser.me/api/portraits/women/79.jpg',
          role: 'researcher',
          location: 'Western Mangroves',
          joinDate: '2022-05-17T00:00:00Z',
          contributions: 73,
          expertise: ['Crab populations', 'Ecosystem dynamics', 'Climate impacts']
        },
        {
          id: 106,
          name: 'Raj Kumar',
          avatar: 'https://randomuser.me/api/portraits/men/52.jpg',
          role: 'coastal_resident',
          location: 'Coral Bay',
          joinDate: '2022-07-29T00:00:00Z',
          contributions: 58,
          expertise: ['Local history', 'Community mobilization', 'Traditional uses']
        }
      ];

      setDiscussions(mockDiscussions);
      setEvents(mockEvents);
      setResources(mockResources);
      setMembers(mockMembers);
      setIsLoading(false);
    }, 1000);
  }, []);

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

  // Helper function to format relative time (e.g., "2 days ago")
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    } else if (diffMinutes > 0) {
      return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    } else {
      return 'Just now';
    }
  };

  // Filter discussions based on search query and category
  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = searchQuery === '' || 
      discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Filter events based on search query, category, and region
  const filteredEvents = events.filter(event => {
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || event.category === selectedCategory;
    
    // Region filtering would be implemented with actual data
    const matchesRegion = true;
    
    return matchesSearch && matchesCategory && matchesRegion;
  });

  // Determine featured event
  const featuredEvent = events.find(event => event.isFeatured) || events[0];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Community</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Connect with fellow conservationists and access community resources
            </p>
          </div>
          
          {/* Search bar */}
          <div className="mt-4 md:mt-0 relative">
            <div className="relative">
              <input
                type="text"
                placeholder="Search community..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input-field pl-10 pr-4 py-2 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('discussions')}
              className={`${
                activeTab === 'discussions'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Discussions
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`${
                activeTab === 'events'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Events
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`${
                activeTab === 'resources'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Resources
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`${
                activeTab === 'members'
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Users className="w-5 h-5 mr-2" />
              Members
            </button>
          </nav>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <>
            {/* Discussion Forum Tab */}
            {activeTab === 'discussions' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="input-field text-sm py-1.5"
                    >
                      <option value="all">All Categories</option>
                      <option value="restoration">Restoration</option>
                      <option value="threats">Threats & Issues</option>
                      <option value="research">Research</option>
                      <option value="education">Education</option>
                      <option value="events">Events</option>
                    </select>
                    <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <Filter className="h-4 w-4 mr-1" />
                      <span className="text-sm">More Filters</span>
                    </button>
                  </div>
                  <button className="btn-primary mt-4 md:mt-0 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    New Discussion
                  </button>
                </div>
                
                {/* Discussion List */}
                <div className="space-y-4">
                  {filteredDiscussions.map(discussion => (
                    <div key={discussion.id} className="card p-6 transition-all hover:shadow-md">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-4">
                          <img 
                            src={discussion.author.avatar} 
                            alt={discussion.author.name} 
                            className="h-12 w-12 rounded-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {discussion.title}
                            </h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300 capitalize">
                              {discussion.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Posted by <span className="font-medium text-gray-900 dark:text-white">{discussion.author.name}</span> • {formatRelativeTime(discussion.timestamp)}
                          </p>
                          <p className="mt-3 text-gray-700 dark:text-gray-300 line-clamp-2">
                            {discussion.content}
                          </p>
                          
                          {/* Tags */}
                          <div className="mt-3 flex flex-wrap gap-2">
                            {discussion.tags.map((tag, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          
                          {/* Actions */}
                          <div className="mt-4 flex items-center space-x-6 text-sm">
                            <button className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>{discussion.likes}</span>
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              <span>{discussion.comments}</span>
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                              <Eye className="h-4 w-4 mr-1" />
                              <span>{discussion.views}</span>
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 ml-auto">
                              <Bookmark className="h-4 w-4 mr-1" />
                              <span>Save</span>
                            </button>
                            <button className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400">
                              <Share2 className="h-4 w-4 mr-1" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredDiscussions.length === 0 && (
                    <div className="card p-8 text-center">
                      <p className="text-gray-600 dark:text-gray-400">
                        No discussions match your search criteria.
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button className="btn-outline flex items-center">
                    View More Discussions
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Events Tab */}
            {activeTab === 'events' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="input-field text-sm py-1.5"
                    >
                      <option value="all">All Event Types</option>
                      <option value="cleanup">Cleanups</option>
                      <option value="workshop">Workshops</option>
                      <option value="training">Training</option>
                      <option value="celebration">Celebrations</option>
                      <option value="cultural">Cultural Events</option>
                    </select>
                    <select
                      value={selectedRegion}
                      onChange={e => setSelectedRegion(e.target.value)}
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
                  <button className="btn-primary mt-4 md:mt-0 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Propose Event
                  </button>
                </div>

                {/* Featured Event */}
                {featuredEvent && (
                  <div className="card overflow-hidden mb-8">
                    <div className="relative h-48 md:h-64">
                      <img 
                        src={featuredEvent.image} 
                        alt={featuredEvent.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-500 text-white">
                          Featured Event
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {featuredEvent.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Organized by {featuredEvent.organizer}
                          </p>
                          <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Calendar className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                            <span>{formatDate(featuredEvent.date)} at {formatTime(featuredEvent.date)}</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                            <span>{featuredEvent.location}</span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Users className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" />
                            <span>{featuredEvent.attendees} people attending</span>
                          </div>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end">
                          <button className="btn-primary mb-2 w-full md:w-auto">
                            Register Now
                          </button>
                          <button className="btn-outline w-full md:w-auto">
                            Add to Calendar
                          </button>
                        </div>
                      </div>
                      <p className="mt-4 text-gray-700 dark:text-gray-300">
                        {featuredEvent.description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Event Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredEvents.filter(event => event.id !== featuredEvent?.id).map(event => (
                    <div key={event.id} className="card overflow-hidden transition-all hover:shadow-md">
                      <div className="relative h-40">
                        <img 
                          src={event.image} 
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-2 py-1">
                          {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                          {event.title}
                        </h3>
                        <div className="mt-2 flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 mr-1 text-primary-600 dark:text-primary-400" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-1 text-primary-600 dark:text-primary-400" />
                          <span>{event.location}</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees} attending
                          </span>
                          <button className="btn-sm btn-outline-primary">
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredEvents.length === 0 && (
                  <div className="card p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-400">
                      No events match your search criteria.
                    </p>
                  </div>
                )}
                
                <div className="mt-8 flex justify-center">
                  <button className="btn-outline flex items-center">
                    View All Events
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Resources Tab */}
            {activeTab === 'resources' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="input-field text-sm py-1.5"
                    >
                      <option value="all">All Resources</option>
                      <option value="guide">Guides</option>
                      <option value="research">Research</option>
                      <option value="education">Educational</option>
                      <option value="protocol">Protocols</option>
                    </select>
                    <button className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                      <Filter className="h-4 w-4 mr-1" />
                      <span className="text-sm">Filter by Type</span>
                    </button>
                  </div>
                  <button className="btn-primary mt-4 md:mt-0 flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Resource
                  </button>
                </div>

                {/* Resources Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map(resource => (
                    <div key={resource.id} className="card overflow-hidden transition-all hover:shadow-md">
                      <div className="relative h-40">
                        <img 
                          src={resource.thumbnail} 
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-0 right-0 bg-primary-600 text-white text-xs font-bold px-2 py-1 uppercase">
                          {resource.type}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">
                          {resource.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          By {resource.author}
                        </p>
                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {resource.description}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {resource.downloads} downloads
                          </span>
                          <div className="flex space-x-2">
                            <button className="btn-sm btn-outline-primary">
                              Preview
                            </button>
                            <button className="btn-sm btn-primary">
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button className="btn-outline flex items-center">
                    Browse Resource Library
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                  <p className="text-gray-600 dark:text-gray-400">
                    Connect with {members.length} community members with expertise in mangrove conservation
                  </p>
                  <div className="mt-4 md:mt-0 flex items-center space-x-4">
                    <select
                      className="input-field text-sm py-1.5"
                      defaultValue="newest"
                    >
                      <option value="newest">Newest Members</option>
                      <option value="active">Most Active</option>
                      <option value="contributions">Most Contributions</option>
                    </select>
                  </div>
                </div>

                {/* Members Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {members.map(member => (
                    <div key={member.id} className="card p-6 transition-all hover:shadow-md">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="h-16 w-16 rounded-full"
                        />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {member.role.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <span>{member.location}</span>
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <span>Joined {formatDate(member.joinDate)}</span>
                      </div>
                      
                      <div className="mt-1 flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <User className="h-4 w-4 mr-2 text-primary-600 dark:text-primary-400" />
                        <span>{member.contributions} contributions</span>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Expertise:</h4>
                        <div className="flex flex-wrap gap-2">
                          {member.expertise.map((skill, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-4 flex space-x-2">
                        <button className="btn-sm btn-outline-primary flex-1">
                          View Profile
                        </button>
                        <button className="btn-sm btn-primary flex-1">
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 flex justify-center">
                  <button className="btn-outline flex items-center">
                    View All Members
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CommunityPage;
