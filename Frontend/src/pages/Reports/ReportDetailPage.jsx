import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  MessageSquare,
  ThumbsUp,
  Flag,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Share2,
  Clock,
  BarChart,
  Camera,
  ClipboardList,
} from "lucide-react";
import { reportsAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import LoadingSpinner from "../../components/UI/LoadingSpinner";
import toast from "react-hot-toast";

const ReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state: authState } = useAuth();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");
  const [comment, setComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching report with ID:", id);

        // Fetch the report by ID from the backend
        const response = await reportsAPI.getById(id);
        console.log("API response:", response);
        console.log("Response data structure:", JSON.stringify(response.data, null, 2));

        if (response.data && response.data.success) {
          const reportData = response.data.data.report;
          console.log("Report data:", reportData);
          console.log("Location structure:", reportData.location);
          setReport(reportData);
        } else {
          console.error("Report not found in response:", response.data);
          setError("Report not found");
        }
        setLoading(false);
      } catch (err) {
        console.error("Error fetching report:", err);
        if (err.response?.status === 404) {
          setError("Report not found");
        } else if (err.response?.status === 403) {
          setError("You do not have permission to view this report");
        } else if (err.response?.status === 401) {
          setError("You need to be logged in to view this report");
        } else {
          setError("Failed to load report details. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmittingComment(true);

      // Submit the comment to the backend
      await reportsAPI.comment(id, { content: comment });

      // Refresh the report data to get updated comments
      const response = await reportsAPI.getById(id);
      if (response.data && response.data.success) {
        setReport(response.data.data.report);
      }

      setComment("");
      toast.success("Comment added successfully");
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast.error("Failed to add comment. Please try again.");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleLike = async () => {
    try {
      // Call the API to like/unlike the report
      await reportsAPI.like(id);

      // Refresh the report data to get updated like count
      const response = await reportsAPI.getById(id);
      if (response.data && response.data.success) {
        setReport(response.data.data.report);
      }

      toast.success(report.isLiked ? "Removed like" : "Added like");
    } catch (err) {
      console.error("Error liking report:", err);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleReport = async () => {
    try {
      // For now, we'll use a simple toast message
      // In a real app, you might want to implement a flagging system
      toast.success("Report flagged for review");
    } catch (err) {
      console.error("Error reporting:", err);
      toast.error("Failed to flag report. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this report? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      // Call the API to delete the report
      await reportsAPI.delete(id);

      toast.success("Report deleted successfully");
      navigate("/reports");
    } catch (err) {
      console.error("Error deleting report:", err);
      toast.error("Failed to delete report. Please try again.");
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      // Call the API to validate/update the report status
      await reportsAPI.validate(id, {
        status: newStatus,
        reviewNotes: `Status changed to ${newStatus.replace(/_/g, " ")}`,
      });

      // Refresh the report data to get updated status
      const response = await reportsAPI.getById(id);
      if (response.data && response.data.success) {
        setReport(response.data.data.report);
      }

      toast.success(`Report status updated to ${newStatus.replace(/_/g, " ")}`);
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update status. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "validated":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "escalated":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "resolved":
        return "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const changeImage = (direction) => {
    if (!report.photos || report.photos.length === 0) return;

    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === report.photos.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? report.photos.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center items-center p-12">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500 dark:text-red-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Error
            </h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <button
              onClick={() => navigate("/reports")}
              className="btn-primary mt-4"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    console.log("Report is null/undefined, loading:", loading, "error:", error);
    return (
      <div className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center p-12">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500 dark:text-yellow-400" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Report Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              The report you're looking for does not exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/reports")}
              className="btn-primary mt-4"
            >
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate("/reports")}
            className="mr-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-grow">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {report.title}
              </h1>
              <span
                className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                  report.status
                )}`}
              >
                {report.status
                  .replace(/_/g, " ")
                  .split(" ")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            </div>
            <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(report.createdAt)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>
                  {report.location?.coordinates ? 
                    `${report.location.coordinates[1]}, ${report.location.coordinates[0]}` : 
                    'Location not available'
                  }
                </span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>
                  Reported by {report.reporter.firstName}{" "}
                  {report.reporter.lastName}
                </span>
              </div>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(
                  report.severity
                )}`}
              >
                {report.severity.charAt(0).toUpperCase() +
                  report.severity.slice(1)}{" "}
                Severity
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="card">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex">
                  <button
                    className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === "details"
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("details")}
                  >
                    Details
                  </button>
                  <button
                    className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === "comments"
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("comments")}
                  >
                    Comments (
                    {report.totalComments || report.comments?.length || 0})
                  </button>
                  <button
                    className={`whitespace-nowrap py-4 px-6 font-medium text-sm border-b-2 ${
                      activeTab === "activity"
                        ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
                    }`}
                    onClick={() => setActiveTab("activity")}
                  >
                    Activity Log
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "details" && (
                  <div className="space-y-6">
                    {report.photos && report.photos.length > 0 && (
                      <div className="relative">
                        <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <img
                            src={report.photos[currentImageIndex].url}
                            alt={
                              report.photos[currentImageIndex].caption ||
                              `Photo ${currentImageIndex + 1}`
                            }
                            className="object-cover w-full h-full"
                          />
                        </div>

                        {report.photos.length > 1 && (
                          <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
                            <div className="flex space-x-2">
                              {report.photos.map((_, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  className={`w-2 h-2 rounded-full ${
                                    index === currentImageIndex
                                      ? "bg-white"
                                      : "bg-white/50 hover:bg-white/80"
                                  }`}
                                  onClick={() => setCurrentImageIndex(index)}
                                  aria-label={`Go to image ${index + 1}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {report.photos.length > 1 && (
                          <>
                            <button
                              type="button"
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                              onClick={() => changeImage("prev")}
                              aria-label="Previous image"
                            >
                              <ArrowLeft className="h-5 w-5" />
                            </button>
                            <button
                              type="button"
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full"
                              onClick={() => changeImage("next")}
                              aria-label="Next image"
                            >
                              <ArrowLeft className="h-5 w-5 transform rotate-180" />
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        Description
                      </h2>
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {report.description}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        Location Details
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Coordinates
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            {report.location.coordinates[1]},{" "}
                            {report.location.coordinates[0]}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Mangrove Area
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            {report.location?.mangroveArea || 'Not specified'}
                          </p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Location
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 mt-1">
                            {report.location?.coordinates ? 
                              `Lat: ${report.location.coordinates[1]}, Lng: ${report.location.coordinates[0]}` : 
                              'Location not available'
                            }
                          </p>
                        </div>
                        {report.location.nearestLandmark && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Nearest Landmark
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 mt-1">
                              {report.location.nearestLandmark}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "comments" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {!report.comments || report.comments.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageSquare className="h-12 w-12 mx-auto text-gray-400" />
                          <p className="mt-2 text-gray-500 dark:text-gray-400">
                            No comments yet. Be the first to comment!
                          </p>
                        </div>
                      ) : (
                        report.comments?.map((comment) => (
                          <div
                            key={comment.id}
                            className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                  {comment.user.avatar ? (
                                    <img
                                      src={comment.user.avatar}
                                      alt={comment.user.name}
                                      className="w-10 h-10 rounded-full"
                                    />
                                  ) : (
                                    <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                  )}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {comment.user.name}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatDate(comment.createdAt)}
                                  </p>
                                </div>
                                <p className="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="mt-6">
                      <form onSubmit={handleCommentSubmit}>
                        <label htmlFor="comment" className="sr-only">
                          Add a comment
                        </label>
                        <textarea
                          id="comment"
                          rows="3"
                          className="form-input w-full"
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                        ></textarea>
                        <div className="mt-2 flex justify-end">
                          <button
                            type="submit"
                            className="btn-primary"
                            disabled={submittingComment || !comment.trim()}
                          >
                            {submittingComment ? "Posting..." : "Post Comment"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Activity Timeline
                    </h2>
                    <div className="flow-root">
                      <ul className="-mb-8">
                        {report.activityLog.map((activity, index) => (
                          <li key={activity.id}>
                            <div className="relative pb-8">
                              {index !== report.activityLog.length - 1 && (
                                <span
                                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                                  aria-hidden="true"
                                ></span>
                              )}
                              <div className="relative flex space-x-3">
                                <div>
                                  <span className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                                    {activity.type === "created" && (
                                      <Clock className="h-5 w-5 text-blue-500" />
                                    )}
                                    {activity.type === "updated" && (
                                      <Edit className="h-5 w-5 text-yellow-500" />
                                    )}
                                    {activity.type === "status_change" && (
                                      <ClipboardList className="h-5 w-5 text-purple-500" />
                                    )}
                                    {activity.type === "comment" && (
                                      <MessageSquare className="h-5 w-5 text-green-500" />
                                    )}
                                    {activity.type === "validation" && (
                                      <CheckCircle className="h-5 w-5 text-teal-500" />
                                    )}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                      {activity.user
                                        ? activity.user.name
                                        : "System"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatDate(activity.createdAt)}
                                    </p>
                                  </div>
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    {activity.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Actions
              </h2>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    className={`btn-outline flex-1 flex items-center justify-center space-x-2 ${
                      report.isLiked
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : ""
                    }`}
                    onClick={handleLike}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>
                      {report.totalLikes || report.likes?.length || 0}{" "}
                      {(report.totalLikes || report.likes?.length || 0) === 1
                        ? "Like"
                        : "Likes"}
                    </span>
                  </button>
                  <button
                    className="btn-outline flex-1 flex items-center justify-center space-x-2"
                    onClick={() => setActiveTab("comments")}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Comment</span>
                  </button>
                </div>

                <button
                  className="btn-outline w-full flex items-center justify-center space-x-2"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link copied to clipboard");
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>

                <button
                  className="btn-outline w-full flex items-center justify-center space-x-2 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                  onClick={handleReport}
                >
                  <Flag className="h-4 w-4" />
                  <span>Report Issue</span>
                </button>

                {/* Show these buttons only for report owners or admins */}
                {(report.reporter.id ===
                  (authState?.user?.id || "current-user") ||
                  authState?.user?.role === "admin") && (
                  <>
                    <button
                      className="btn-outline w-full flex items-center justify-center space-x-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                      onClick={() => navigate(`/reports/edit/${id}`)}
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit Report</span>
                    </button>

                    <button
                      className="btn-outline w-full flex items-center justify-center space-x-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                      onClick={handleDelete}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Report</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Status Management - Show for admins or appropriate roles */}
            {(authState?.user?.role === "admin" ||
              authState?.user?.role === "government_officer" ||
              authState?.user?.role === "ngo_admin") && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Manage Status
                </h2>
                <div className="space-y-3">
                  <button
                    className={`btn-outline w-full flex items-center justify-center space-x-2 ${
                      report.status === "under_review"
                        ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                        : ""
                    }`}
                    onClick={() => handleStatusChange("under_review")}
                    disabled={report.status === "under_review"}
                  >
                    <Clock className="h-4 w-4" />
                    <span>Mark Under Review</span>
                  </button>

                  <button
                    className={`btn-outline w-full flex items-center justify-center space-x-2 ${
                      report.status === "validated"
                        ? "bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                        : ""
                    }`}
                    onClick={() => handleStatusChange("validated")}
                    disabled={report.status === "validated"}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Validate</span>
                  </button>

                  <button
                    className={`btn-outline w-full flex items-center justify-center space-x-2 ${
                      report.status === "rejected"
                        ? "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                        : ""
                    }`}
                    onClick={() => handleStatusChange("rejected")}
                    disabled={report.status === "rejected"}
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>

                  <button
                    className={`btn-outline w-full flex items-center justify-center space-x-2 ${
                      report.status === "escalated"
                        ? "bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
                        : ""
                    }`}
                    onClick={() => handleStatusChange("escalated")}
                    disabled={report.status === "escalated"}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    <span>Escalate</span>
                  </button>

                  <button
                    className={`btn-outline w-full flex items-center justify-center space-x-2 ${
                      report.status === "resolved"
                        ? "bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
                        : ""
                    }`}
                    onClick={() => handleStatusChange("resolved")}
                    disabled={report.status === "resolved"}
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Mark Resolved</span>
                  </button>
                </div>
              </div>
            )}

            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Report Information
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </h3>
                  <p className="text-gray-900 dark:text-white mt-1 capitalize">
                    {report.category.replace(/_/g, " ")}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Report ID
                  </h3>
                  <p className="text-gray-900 dark:text-white mt-1 font-mono">
                    {report.id}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Validation Score
                  </h3>
                  <div className="mt-1">
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${report.validationScore}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        {report.validationScore}%
                      </span>
                    </div>
                  </div>
                </div>

                {report.lastUpdated && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Last Updated
                    </h3>
                    <p className="text-gray-900 dark:text-white mt-1">
                      {formatDate(report.lastUpdated)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetailPage;
