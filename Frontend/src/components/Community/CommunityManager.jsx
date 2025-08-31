import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  MapPin,
  Users,
  BookOpen,
  Heart,
  LogOut,
  Settings,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import { communityAPI } from "../../services/api";
import { toast } from "react-hot-toast";

const CommunityManager = () => {
  const [activeTab, setActiveTab] = useState("my-communities");
  const [myCommunities, setMyCommunities] = useState([]);
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [focusAreaFilter, setFocusAreaFilter] = useState("");

  const tabs = [
    { id: "my-communities", name: "My Communities", icon: Users },
    { id: "discover", name: "Discover Communities", icon: Globe },
    { id: "create", name: "Create Community", icon: Plus },
  ];

  const fetchMyCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await communityAPI.getMyCommunities();
      if (response.data.success) {
        setMyCommunities(response.data.data.communities || []);
      }
    } catch (error) {
      console.error("Error fetching my communities:", error);
      toast.error("Failed to fetch your communities");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscoverCommunities = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (locationFilter) params.location = locationFilter;
      if (focusAreaFilter) params.focusArea = focusAreaFilter;

      const response = await communityAPI.discoverCommunities(params);
      if (response.data.success) {
        setDiscoverCommunities(response.data.data.communities || []);
      }
    } catch (error) {
      console.error("Error discovering communities:", error);
      toast.error("Failed to discover communities");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, locationFilter, focusAreaFilter]);

  useEffect(() => {
    if (activeTab === "my-communities") {
      fetchMyCommunities();
    } else if (activeTab === "discover") {
      fetchDiscoverCommunities();
    }
  }, [activeTab, fetchMyCommunities, fetchDiscoverCommunities]);

  const handleJoinCommunity = async (communityId) => {
    try {
      await communityAPI.joinCommunity(communityId);
      toast.success("Successfully joined the community!");
      fetchMyCommunities();
      fetchDiscoverCommunities();
    } catch (error) {
      console.error("Error joining community:", error);
      toast.error("Failed to join community");
    }
  };

  const handleLeaveCommunity = async (communityId) => {
    if (!window.confirm("Are you sure you want to leave this community?")) {
      return;
    }

    try {
      await communityAPI.leaveCommunity(communityId);
      toast.success("Successfully left the community");
      fetchMyCommunities();
      fetchDiscoverCommunities();
    } catch (error) {
      console.error("Error leaving community:", error);
      toast.error("Failed to leave community");
    }
  };

  const handleCreateCommunity = async (formData) => {
    try {
      const response = await communityAPI.createCommunity(formData);

      if (response.data.success) {
        toast.success("Community created successfully!");
        setShowCreateModal(false);
        fetchMyCommunities();
      } else {
        toast.error(response.data.message || "Failed to create community");
      }
    } catch (error) {
      console.error("Error creating community:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to create community";
      toast.error(errorMessage);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "my-communities":
        return (
          <MyCommunitiesTab
            communities={myCommunities}
            onLeave={handleLeaveCommunity}
          />
        );
      case "discover":
        return (
          <DiscoverCommunitiesTab
            communities={discoverCommunities}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            locationFilter={locationFilter}
            setLocationFilter={setLocationFilter}
            focusAreaFilter={focusAreaFilter}
            setFocusAreaFilter={setFocusAreaFilter}
            onJoin={handleJoinCommunity}
            onRefresh={fetchDiscoverCommunities}
          />
        );
      case "create":
        return <CreateCommunityTab onCreate={handleCreateCommunity} />;
      default:
        return null;
    }
  };

  if (loading && activeTab !== "create") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Community Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create, join, and manage your communities
          </p>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? "border-green-500 text-green-600 dark:text-green-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {renderTabContent()}
    </div>
  );
};

const MyCommunitiesTab = ({ communities, onLeave }) => {
  if (communities.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
          No communities yet
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          You haven't joined any communities yet. Discover and join communities
          to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {communities.map((community) => (
        <div
          key={community._id}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {community.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {community.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{community.totalMembers} members</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {community.location?.city || "N/A"},{" "}
                    {community.location?.state || "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  <span>{community.totalReports} reports</span>
                </div>
              </div>

              {community.focusAreas && community.focusAreas.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {community.focusAreas.map((area, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => onLeave(community._id)}
              className="ml-4 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Leave
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

const DiscoverCommunitiesTab = ({
  communities,
  searchQuery,
  setSearchQuery,
  locationFilter,
  setLocationFilter,
  focusAreaFilter,
  setFocusAreaFilter,
  onJoin,
  onRefresh,
}) => {
  const focusAreas = [
    "Mangrove Conservation",
    "Community Engagement",
    "Environmental Education",
    "Research Collaboration",
    "Policy Advocacy",
    "Coastal Protection",
    "Wildlife Conservation",
    "Sustainable Development",
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Communities
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="City or state..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Focus Area
            </label>
            <select
              value={focusAreaFilter}
              onChange={(e) => setFocusAreaFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">All focus areas</option>
              {focusAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={onRefresh}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
          >
            Refresh Results
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            {communities.length} communities found
          </div>
        </div>
      </div>

      {communities.length === 0 ? (
        <div className="text-center py-12">
          <Globe className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No communities found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search criteria or create a new community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {communities.map((community) => (
            <div
              key={community._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {community.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {community.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{community.totalMembers} members</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {community.location?.city || "N/A"},{" "}
                        {community.location?.state || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <BookOpen className="h-4 w-4" />
                      <span>{community.totalReports} reports</span>
                    </div>
                  </div>

                  {community.focusAreas && community.focusAreas.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {community.focusAreas.map((area, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                        >
                          {area}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onJoin(community._id)}
                  className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const CreateCommunityTab = ({ onCreate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: {
      address: "",
      city: "",
      state: "",
      country: "India",
    },
    focusAreas: [],
    contactInfo: {
      email: "",
      phone: "",
      website: "",
    },
  });

  const focusAreas = [
    "Mangrove Conservation",
    "Community Engagement",
    "Environmental Education",
    "Research Collaboration",
    "Policy Advocacy",
    "Coastal Protection",
    "Wildlife Conservation",
    "Sustainable Development",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleFocusAreaToggle = (area) => {
    setFormData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((a) => a !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Name and description are required");
      return;
    }

    // Create a properly formatted submission object
    const submissionData = {
      ...formData,
      location: {
        ...formData.location,
        coordinates: formData.location?.coordinates || [0, 0],
        address: {
          street: formData.location?.address || "",
          city: formData.location?.city || "",
          state: formData.location?.state || "",
          country: formData.location?.country || "India",
        },
      },
      focusAreas: formData.focusAreas || [],
      contactInfo: formData.contactInfo || {},
    };

    // Submit the data and reset form
    onCreate(submissionData);
    setFormData({
      name: "",
      description: "",
      location: { address: "", city: "", state: "", country: "India" },
      focusAreas: [],
      contactInfo: { email: "", phone: "", website: "" },
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
          Create New Community
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Community Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter community name..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              placeholder="Describe your community's mission and goals..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                City
              </label>
              <input
                type="text"
                name="location.city"
                value={formData.location.city}
                onChange={handleInputChange}
                placeholder="Mumbai"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                State
              </label>
              <input
                type="text"
                name="location.state"
                value={formData.location.state}
                onChange={handleInputChange}
                placeholder="Maharashtra"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Focus Areas
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {focusAreas.map((area) => (
                <label key={area} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.focusAreas.includes(area)}
                    onChange={() => handleFocusAreaToggle(area)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {area}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleInputChange}
                placeholder="contact@community.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              <input
                type="url"
                name="contactInfo.website"
                value={formData.contactInfo.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunityManager;
