import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../services/api";
import DashboardHeader from "../../components/Dashboard/DashboardHeader";
import {
  Shield,
  Users,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  MapPin,
  Calendar,
  Clock,
} from "lucide-react";

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFilter, setTimeFilter] = useState("7d");
  const [regionFilter, setRegionFilter] = useState("all");

  // Real data state
  const [statsData, setStatsData] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [overviewData, setOverviewData] = useState({});

  // Fetch data from API
  useEffect(() => {
    // Only fetch data if user is authenticated
    if (!isAuthenticated || !user) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch dashboard overview
        const overviewResponse = await api.get("/dashboard/overview");
        const overview = overviewResponse.data.overview;
        setOverviewData(overview);

        // Transform overview data to stats format
        const formatChange = (change) => {
          const numChange = parseFloat(change);
          return `${numChange > 0 ? "+" : ""}${numChange}%`;
        };

        const stats = [
          {
            id: 1,
            name: "Total Reports",
            value: overview.thisMonthReports?.toLocaleString() || "0",
            change: formatChange(overview.reportsChange || 0),
            changeType: overview.reportsChange >= 0 ? "positive" : "negative",
            icon: Shield,
            color: "primary",
          },
          {
            id: 2,
            name: "Active Users",
            value: overview.thisMonthUsers?.toLocaleString() || "0",
            change: formatChange(overview.usersChange || 0),
            changeType: overview.usersChange >= 0 ? "positive" : "negative",
            icon: Users,
            color: "success",
          },
          {
            id: 3,
            name: "Validated Reports",
            value: overview.thisMonthValidated?.toLocaleString() || "0",
            change: formatChange(overview.validatedChange || 0),
            changeType: overview.validatedChange >= 0 ? "positive" : "negative",
            icon: CheckCircle,
            color: "info",
          },
          {
            id: 4,
            name: "Urgent Cases",
            value: overview.thisMonthUrgent?.toString() || "0",
            change: formatChange(overview.urgentChange || 0),
            changeType: overview.urgentChange >= 0 ? "positive" : "negative",
            icon: AlertTriangle,
            color: "warning",
          },
        ];

        setStatsData(stats);

        // Fetch recent reports using the API service
        const reportsResponse = await api.get(
          "/reports?limit=5&sortBy=createdAt&sortOrder=desc"
        );

        if (reportsResponse.data) {
          const reports = reportsResponse.data.reports.map((report) => ({
            id: report._id,
            title: report.title,
            status: report.status,
            location: `${report.location.address?.city || "Unknown"}, ${
              report.location.address?.state || "Unknown"
            }`,
            time: formatTimeAgo(report.createdAt),
            author: {
              name: `${report.reporter.firstName} ${report.reporter.lastName}`,
              avatar:
                report.reporter.avatar ||
                "https://randomuser.me/api/portraits/lego/1.jpg",
            },
            category: report.category,
            images: report.photos?.map((photo) => photo.url) || [],
          }));
          setRecentReports(reports);
        }

        // Fetch community events for upcoming events
        const eventsResponse = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:5002/api"
          }/community/events?upcoming=true&limit=3`
        );
        if (eventsResponse.ok) {
          const eventsData = await eventsResponse.json();
          const events = eventsData.data.events.map((event) => ({
            id: event.id,
            title: event.title,
            date: new Date(event.date),
            location: event.location,
            attendees: event.currentParticipants,
            isRegistered: false, // This would need to be checked against user's registrations
          }));
          setUpcomingEvents(events);
        }

        // Generate recent activities based on user's reports and system events
        const activities = await generateRecentActivities(user);
        setRecentActivities(activities);
      } catch (err) {
        console.error("Error loading dashboard data:", err);

        // Check if it's a network error (backend not running)
        if (
          err.code === "ERR_NETWORK" ||
          err.message?.includes("Network Error") ||
          err.message?.includes("fetch")
        ) {
          setError(
            "Unable to connect to the server. Please make sure the backend is running."
          );
        } else {
          // Don't show error immediately, just log it
          // setError('Failed to load dashboard data. Please try again later.');
        }

        // Set some fallback data so the dashboard doesn't look empty
        setStatsData([
          {
            id: 1,
            name: "Total Reports",
            value: "0",
            change: "+0%",
            changeType: "positive",
            icon: Shield,
            color: "primary",
          },
          {
            id: 2,
            name: "Active Users",
            value: "1",
            change: "+0%",
            changeType: "positive",
            icon: Users,
            color: "success",
          },
          {
            id: 3,
            name: "Validated Reports",
            value: "0",
            change: "+0%",
            changeType: "positive",
            icon: CheckCircle,
            color: "info",
          },
          {
            id: 4,
            name: "Urgent Cases",
            value: "0",
            change: "+0%",
            changeType: "negative",
            icon: AlertTriangle,
            color: "warning",
          },
        ]);

        setRecentReports([]);
        setRecentActivities([]);
        setUpcomingEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, isAuthenticated, timeFilter, regionFilter]);

  // Helper function to generate recent activities
  const generateRecentActivities = async (user) => {
    const activities = [];

    try {
      // Get user's recent reports
      const userReportsResponse = await fetch(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:5002/api"
        }/users/reports?limit=3`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (userReportsResponse.ok) {
        const userReportsData = await userReportsResponse.json();
        userReportsData.data.reports.forEach((report, index) => {
          activities.push({
            id: `report_${index + 1}`,
            type: "report_submitted",
            user: {
              name: "You",
              avatar:
                user?.profileImage ||
                "https://randomuser.me/api/portraits/lego/1.jpg",
            },
            content: `Submitted a new report about ${report.category}`,
            time: formatTimeAgo(report.createdAt),
            link: `/reports/${report._id}`,
          });
        });
      }

      // Add some system activities
      if (user?.points > 100) {
        activities.push({
          id: "achievement_1",
          type: "achievement",
          user: {
            name: "System",
            avatar: null,
          },
          content: 'You earned the "Environmental Guardian" badge',
          time: "1 day ago",
          link: "/profile/achievements",
        });
      }
    } catch (error) {
      console.error("Error generating activities:", error);
    }

    return activities.slice(0, 5); // Limit to 5 activities
  };

  // Helper function to format time ago
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

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to format time
  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleTimeString(undefined, options);
  };

  const getQuickActions = () => {
    const actions = [
      {
        title: "Submit Report",
        description: "Report a new incident or threat",
        icon: Shield,
        color: "primary",
        link: "/reports/submit",
        action: () => (window.location.href = "/reports/submit"),
      },
      {
        title: "View Reports",
        description: "Check status of your reports",
        icon: TrendingUp,
        color: "success",
        link: "/reports",
        action: () => (window.location.href = "/reports"),
      },
      {
        title: "Community",
        description: "Connect with other members",
        icon: Users,
        color: "info",
        link: "/community",
        action: () => (window.location.href = "/community"),
      },
      {
        title: "Leaderboard",
        description: "Check your ranking",
        icon: TrendingUp,
        color: "warning",
        link: "/gamification/leaderboard",
        action: () => (window.location.href = "/gamification/leaderboard"),
      },
    ];

    return actions;
  };

  // Show loading state while authenticating
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            Please log in to view dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Only show error if we actually have an error and we're not loading
  if (error && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error Loading Dashboard
          </h2>
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
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        timeFilter={timeFilter}
        setTimeFilter={setTimeFilter}
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.id}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.name}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-${stat.color}-100`}>
                    <IconComponent
                      className={`h-6 w-6 text-${stat.color}-600`}
                    />
                  </div>
                </div>
                <div className="mt-4 flex items-center">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === "positive"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    from last month
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Reports
                </h3>
              </div>
              <div className="p-6">
                {recentReports.length > 0 ? (
                  <div className="space-y-4">
                    {recentReports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={report.author.avatar}
                            alt={report.author.name}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {report.title}
                            </p>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                report.status === "urgent"
                                  ? "bg-red-100 text-red-800"
                                  : report.status === "validated"
                                  ? "bg-green-100 text-green-800"
                                  : report.status === "investigating"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <MapPin className="h-4 w-4 mr-1" />
                            {report.location}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <Clock className="h-4 w-4 mr-1" />
                            {report.time}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              by {report.author.name}
                            </span>
                            {report.images.length > 0 && (
                              <div className="flex space-x-1">
                                {report.images
                                  .slice(0, 3)
                                  .map((image, index) => (
                                    <img
                                      key={index}
                                      src={image}
                                      alt="Evidence"
                                      className="h-8 w-8 rounded object-cover"
                                    />
                                  ))}
                                {report.images.length > 3 && (
                                  <div className="h-8 w-8 rounded bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                                    +{report.images.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No recent reports found.</p>
                  </div>
                )}
                <div className="mt-6">
                  <a
                    href="/reports"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View all reports →
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {getQuickActions().map((action) => {
                    const IconComponent = action.icon;
                    return (
                      <button
                        key={action.title}
                        onClick={action.action}
                        className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div
                          className={`p-2 rounded-lg bg-${action.color}-100 mr-3`}
                        >
                          <IconComponent
                            className={`h-5 w-5 text-${action.color}-600`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {action.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {action.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activities
                </h3>
              </div>
              <div className="p-6">
                {recentActivities.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start space-x-3"
                      >
                        <div className="flex-shrink-0">
                          {activity.user.avatar ? (
                            <img
                              src={activity.user.avatar}
                              alt={activity.user.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-xs text-gray-500">S</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">
                              {activity.user.name}
                            </span>{" "}
                            {activity.content}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No recent activities.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Upcoming Events
                </h3>
              </div>
              <div className="p-6">
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-900">
                            {event.title}
                          </h4>
                          <span className="text-xs text-gray-500">
                            {formatDate(event.date)}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {event.location}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {event.attendees} attending
                          </span>
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                            {event.isRegistered ? "Registered" : "Register"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No upcoming events.</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
