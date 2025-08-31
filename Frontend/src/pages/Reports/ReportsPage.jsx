import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { reportsAPI } from '../../services/api';
import { Shield, MapPin, Calendar, Clock, Filter, Search, Eye, Edit, Trash, AlertTriangle } from 'lucide-react';

const ReportsPage = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    severity: '',
    dateRange: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReports: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const params = {
          page: pagination.currentPage,
          limit: 20,
          ...(filters.category && { category: filters.category }),
          ...(filters.status && { status: filters.status }),
          ...(filters.severity && { severity: filters.severity }),
          ...(searchTerm && { search: searchTerm }),
          sort: sortBy,
          order: sortOrder
        };
        
        // If we have a dateRange filter, convert it to actual dates
        if (filters.dateRange !== 'all') {
          const now = new Date();
          let startDate = new Date();
          
          if (filters.dateRange === 'today') {
            startDate.setHours(0, 0, 0, 0);
          } else if (filters.dateRange === 'week') {
            startDate.setDate(now.getDate() - 7);
          } else if (filters.dateRange === 'month') {
            startDate.setMonth(now.getMonth() - 1);
          } else if (filters.dateRange === 'year') {
            startDate.setFullYear(now.getFullYear() - 1);
          }
          
          params.startDate = startDate.toISOString();
          params.endDate = now.toISOString();
        }
        
        const response = await reportsAPI.getAll(params);
        
        if (response.data.success) {
          setReports(response.data.data.reports);
          setPagination(response.data.data.pagination);
        } else {
          setError("Failed to load reports. Please try again later.");
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError("Failed to load reports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filters, searchTerm, sortBy, sortOrder, pagination.currentPage]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      return;
    }

    try {
      await reportsAPI.delete(reportId);
      // Remove the deleted report from the list
      setReports(prev => prev.filter(report => report._id !== reportId));
      // Update total count
      setPagination(prev => ({ 
        ...prev, 
        totalReports: prev.totalReports - 1,
        totalPages: Math.ceil((prev.totalReports - 1) / 20)
      }));
    } catch (error) {
      console.error('Error deleting report:', error);
      alert('Failed to delete report. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-900/30 text-yellow-300 border border-yellow-700', icon: Clock },
      under_review: { color: 'bg-blue-900/30 text-blue-300 border border-blue-700', icon: Eye },
      validated: { color: 'bg-green-900/30 text-green-300 border border-green-700', icon: Shield },
      rejected: { color: 'bg-red-900/30 text-red-300 border border-red-700', icon: AlertTriangle },
      escalated: { color: 'bg-purple-900/30 text-purple-300 border border-purple-700', icon: AlertTriangle },
      resolved: { color: 'bg-gray-700 text-gray-300 border border-gray-600', icon: Shield }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { color: 'bg-green-900/30 text-green-300 border border-green-700' },
      medium: { color: 'bg-yellow-900/30 text-yellow-300 border border-yellow-700' },
      high: { color: 'bg-orange-900/30 text-orange-300 border border-orange-700' },
      critical: { color: 'bg-red-900/30 text-red-300 border border-red-700' }
    };

    const config = severityConfig[severity] || severityConfig.medium;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      illegal_cutting: '🌳',
      land_reclamation: '🏗️',
      pollution: '☣️',
      dumping: '🗑️',
      construction: '🏢',
      other: '❓'
    };
    return categoryIcons[category] || '❓';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading Reports</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Reports</h1>
          <p className="mt-2 text-gray-300">
            Monitor and manage mangrove incident reports from the community
          </p>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
              <div>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">All Categories</option>
                <option value="illegal_cutting">Illegal Cutting</option>
                <option value="land_reclamation">Land Reclamation</option>
                <option value="pollution">Pollution</option>
                <option value="dumping">Dumping</option>
                <option value="construction">Construction</option>
                <option value="other">Other</option>
                </select>
              </div>

            {/* Status Filter */}
              <div>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="validated">Validated</option>
                <option value="rejected">Rejected</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
                </select>
              </div>

            {/* Date Range Filter */}
              <div>
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                </select>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">
                {pagination.totalReports} Reports Found
              </h2>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">Sort by:</span>
                <button
                  onClick={() => handleSortChange('createdAt')}
                  className={`text-sm font-medium ${
                    sortBy === 'createdAt' ? 'text-primary-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Date {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSortChange('severity')}
                  className={`text-sm font-medium ${
                    sortBy === 'severity' ? 'text-primary-400' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  Severity {sortBy === 'severity' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
            </div>
            </div>
            </div>

            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Report
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Category
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Severity
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Status
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Location
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Date
                    </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-700 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {report.photos && report.photos.length > 0 ? (
                            <img
                              className="h-10 w-10 rounded-lg object-cover"
                              src={report.photos[0].url}
                              alt="Report evidence"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-500 text-sm">📷</span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white">
                            {report.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            by {report.reporter?.firstName} {report.reporter?.lastName}
                          </div>
                        </div>
                      </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">{getCategoryIcon(report.category)}</span>
                        <span className="text-sm text-white">
                          {report.category.replace('_', ' ').charAt(0).toUpperCase() + report.category.replace('_', ' ').slice(1)}
                        </span>
                      </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      {getSeverityBadge(report.severity)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-white">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {report.location.address?.city || 'Unknown'}, {report.location.address?.state || 'Unknown'}
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {formatDate(report.createdAt)}
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatTimeAgo(report.createdAt)}
                        </div>
                      </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <a
                          href={`/reports/${report._id}`}
                          className="text-primary-400 hover:text-primary-300 p-1 rounded hover:bg-primary-500/10 transition-colors duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        {report.reporter?._id === user?.id && (
                          <>
                            <a
                              href={`/reports/${report._id}/edit`}
                              className="text-green-400 hover:text-green-300 p-1 rounded hover:bg-green-500/10 transition-colors duration-200"
                              title="Edit Report"
                            >
                              <Edit className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleDeleteReport(report._id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-red-500/10 transition-colors duration-200"
                              title="Delete Report"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-600 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                    <span className="font-medium">{pagination.totalPages}</span> pages
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.currentPage
                              ? 'z-10 bg-primary-500/20 border-primary-500 text-primary-400'
                              : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-600 bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Empty State */}
        {reports.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-white mb-2">No reports found</h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || Object.values(filters).some(f => f !== '' && f !== 'all')
                ? 'Try adjusting your search or filters.'
                : 'Get started by submitting your first report.'}
            </p>
            <a
              href="/reports/submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 transition-colors duration-200"
            >
              Submit Report
            </a>
            </div>
          )}
      </div>
    </div>
  );
};

export default ReportsPage;
