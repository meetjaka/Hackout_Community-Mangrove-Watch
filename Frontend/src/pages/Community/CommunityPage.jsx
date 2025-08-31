import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { MapPin, Users, Leaf, Search, Filter, BookOpen, Users as UsersIcon, BarChart3, Shield, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { communityAPI } from "../../services/api";
import { 
  CommunityPageSkeleton, 
  StatsSkeleton, 
  ResourcesSkeleton, 
  GuidelinesSkeleton 
} from "../../components/UI/SkeletonLoader";
import CommunityManager from "../../components/Community/CommunityManager";

const CommunityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeCommunities: 0,
    totalMangroveAreas: 0,
  });
  const [resources, setResources] = useState([]);
  const [guidelines, setGuidelines] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  
  // Auto-refresh state
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "resources", name: "Resources", icon: BookOpen },
    { id: "guidelines", name: "Guidelines", icon: Shield },
    { id: "events", name: "Events", icon: Calendar },
    { id: "partners", name: "Partners", icon: Users },
    { id: "communities", name: "My Communities", icon: UsersIcon }
  ];

  // Fetch community overview data
  const fetchOverview = useCallback(async () => {
    try {
      const response = await communityAPI.getOverview();
      if (response.data.success) {
        const { overview, topContributors: contributors, recentActivity: activity } = response.data.data;
        setStats({
          totalMembers: overview.totalUsers || 0,
          activeCommunities: overview.activeCommunities || 0,
          totalMangroveAreas: overview.totalMangroveAreas || 0,
        });
        setTopContributors(contributors || []);
        setRecentActivity(activity || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error("Error fetching community overview:", err);
      if (!error) {
        setError("Failed to load community overview");
        toast.error("Error loading community overview");
      }
    }
  }, [error]);

  // Fetch educational resources
  const fetchResources = useCallback(async () => {
    try {
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        language: selectedLanguage || undefined,
      };
      
      const response = await communityAPI.getResources(params);
      if (response.data.success) {
        setResources(response.data.data.resources || []);
      }
    } catch (err) {
      console.error("Error fetching resources:", err);
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        // Community data not found - this is expected if not seeded yet
        console.log("Community data not found - resources will be empty until data is seeded");
        setResources([]);
      } else {
        toast.error("Error loading educational resources");
      }
    }
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedLanguage]);

  // Fetch community guidelines
  const fetchGuidelines = useCallback(async () => {
    try {
      const response = await communityAPI.getGuidelines();
      if (response.data.success) {
        setGuidelines(response.data.data.guidelines || []);
      }
    } catch (err) {
      console.error("Error fetching guidelines:", err);
      
      // Handle specific error cases
      if (err.response?.status === 404) {
        // Community data not found - this is expected if not seeded yet
        console.log("Community data not found - guidelines will be empty until data is seeded");
        setGuidelines([]);
      } else {
        toast.error("Error loading community guidelines");
      }
    }
  }, []);

  // Main data fetching function
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      await Promise.all([
        fetchOverview(),
        fetchResources(),
        fetchGuidelines()
      ]);
      
    } catch (err) {
      setError("Failed to load community data");
      toast.error("Error loading community data");
      console.error("Error fetching community data:", err);
    } finally {
      setLoading(false);
    }
  }, [fetchOverview, fetchResources, fetchGuidelines]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchOverview(); // Only refresh overview data, not all data
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchOverview]);

  // Handle search and filter changes with debounced fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!loading) {
        fetchResources();
      }
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, selectedDifficulty, selectedLanguage, loading]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDifficultyChange = (e) => {
    setSelectedDifficulty(e.target.value);
  };

  const handleLanguageChange = (e) => {
    setSelectedLanguage(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSelectedLanguage("en");
  };

  if (loading) {
    return <CommunityPageSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Community Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect, learn, and collaborate with the mangrove conservation community
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-500 font-semibold'
                    : 'border-transparent text-gray-600 hover:text-green-500 hover:border-green-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "communities" ? (
        <CommunityManager />
      ) : (
        <>
          {/* Auto-refresh indicator */}
          <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Auto-refresh
          </span>
        </label>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Members
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalMembers.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <MapPin className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Active Communities
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.activeCommunities.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Mangrove Areas
              </p>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {stats.totalMangroveAreas.toLocaleString()}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="education">Education</option>
            <option value="guide">Guide</option>
            <option value="inspiration">Inspiration</option>
            <option value="legal">Legal</option>
            <option value="technical">Technical</option>
          </select>

          {/* Difficulty Filter */}
          <select
            value={selectedDifficulty}
            onChange={handleDifficultyChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="all">All Levels</option>
          </select>

          {/* Language Filter */}
          <select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
          </select>

          {/* Clear Filters Button */}
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Resources Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Educational Resources
            </h2>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {resources.length} resources found
            </span>
          </div>
        </div>
        <div className="px-6 py-4">
          {resources.length > 0 ? (
            <div className="space-y-4">
              {resources.map((resource, index) => (
                <div key={index} className="flex items-start p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {resource.title}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        resource.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        resource.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        resource.difficulty === 'advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {resource.difficulty}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">
                        {resource.estimatedTime}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      {resource.description}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {resource.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <a
                    href={resource.url}
                    className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors whitespace-nowrap"
                  >
                    View Resource
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="mb-3">
                <BookOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium mb-2">No Educational Resources Yet</p>
              <p className="text-sm">
                {searchTerm || selectedCategory || selectedDifficulty || selectedLanguage !== 'en' 
                  ? 'No resources found matching your current filters. Try adjusting your search criteria.'
                  : 'Educational resources will appear here once the community data is set up. This usually happens automatically when the first community member joins.'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
            <UsersIcon className="h-5 w-5 mr-2" />
            Community Guidelines
          </h2>
        </div>
        <div className="px-6 py-4">
          {guidelines.length > 0 ? (
            <ul className="space-y-3 text-gray-600 dark:text-gray-400">
              {guidelines.map((guideline, index) => (
                <li key={index} className="flex items-start">
                  <span className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3 mt-0.5 text-sm font-medium">
                    {guideline.order}
                  </span>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {guideline.title}
                    </span>
                    {guideline.description && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {guideline.description}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <div className="mb-3">
                <BookOpen className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-lg font-medium mb-2">No Community Guidelines Yet</p>
              <p className="text-sm">
                Community guidelines will appear here once the community data is set up. 
                This usually happens automatically when the first community member joins.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top Contributors Section */}
      {topContributors.length > 0 && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Top Contributors
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topContributors.slice(0, 6).map((contributor, index) => (
                <div key={contributor.id || index} className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 font-semibold">
                    {contributor.firstName?.charAt(0) || 'U'}
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {contributor.firstName} {contributor.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {contributor.points} points • Level {contributor.level}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-emerald-400 to-green-500 rounded-lg shadow-lg p-8 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
        <p className="text-white opacity-90 mb-6 max-w-2xl mx-auto">
          Connect with fellow conservationists, share your experiences, and
          contribute to mangrove protection efforts
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/reports/submit"
            className="bg-white text-green-500 px-8 py-3 rounded-full font-semibold hover:bg-opacity-90 transition-colors"
          >
            Submit a Report
          </a>
          <a
            href="/community/events"
            className="bg-green-500 border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition-colors"
          >
            Join an Event
          </a>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default CommunityPage;
