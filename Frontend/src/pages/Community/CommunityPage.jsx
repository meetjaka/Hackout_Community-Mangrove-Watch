import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { MapPin, Users, Leaf } from "lucide-react";
import toast from "react-hot-toast";
import { communityAPI } from "../../services/api";

const CommunityPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeCommunities: 0,
    totalMangroveAreas: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Simulated data for initial setup
      // Replace this with actual API call when backend is ready
      const mockData = {
        totalMembers: 150,
        activeCommunities: 12,
        totalMangroveAreas: 25,
      };
      setStats(mockData);

      // When backend is ready, uncomment this:
      // const response = await communityAPI.getOverview();
      // setStats(response.data);
    } catch (err) {
      setError("Failed to load community data");
      toast.error("Error loading community data");
      console.error("Error fetching community data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
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
                {stats.totalMembers}
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
                {stats.activeCommunities}
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
                {stats.totalMangroveAreas}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Educational Resources
          </h2>
        </div>
        <div className="px-6 py-4">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Mangrove Conservation Guide
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Learn about best practices for mangrove conservation and
                  restoration.
                </p>
              </div>
              <a
                href="#"
                className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                View Guide
              </a>
            </div>
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Community Engagement Toolkit
                </h3>
                <p className="mt-1 text-gray-600 dark:text-gray-400">
                  Resources for organizing and managing community conservation
                  efforts.
                </p>
              </div>
              <a
                href="#"
                className="ml-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                View Toolkit
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Community Guidelines
          </h2>
        </div>
        <div className="px-6 py-4">
          <ul className="space-y-3 text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <span className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                1
              </span>
              <span>
                Respect and protect mangrove ecosystems during all activities
              </span>
            </li>
            <li className="flex items-start">
              <span className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                2
              </span>
              <span>
                Report any suspicious or harmful activities to local authorities
              </span>
            </li>
            <li className="flex items-start">
              <span className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                3
              </span>
              <span>
                Participate in regular community meetings and conservation
                events
              </span>
            </li>
            <li className="flex items-start">
              <span className="h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3 mt-0.5">
                4
              </span>
              <span>
                Share knowledge and experiences with other community members
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-8 text-center text-white">
        <h2 className="text-2xl font-bold mb-4">Join Our Community</h2>
        <p className="text-green-100 mb-6 max-w-2xl mx-auto">
          Connect with fellow conservationists, share your experiences, and
          contribute to mangrove protection efforts
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/reports/submit"
            className="bg-white text-green-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Submit a Report
          </a>
          <a
            href="/community/events"
            className="border-2 border-white text-white px-6 py-2 rounded-lg font-medium hover:bg-white hover:text-green-600 transition-colors"
          >
            Join an Event
          </a>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
