import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, MapPin, AlertTriangle, Calendar, ArrowUpDown, Eye, Plus } from 'lucide-react';
import { reportsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const ReportsPage = () => {
  const { state: authState } = useAuth();
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
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const params = {
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
        
        // In a real app, we would use the params for the API call
        // For this demo, we'll use mock data
        // const response = await reportsAPI.getAll(params);
        // setReports(response.data);
        
        // Mock data for demonstration
        setTimeout(() => {
          setReports(mockReports);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError("Failed to load reports. Please try again later.");
        setLoading(false);
      }
    };

    fetchReports();
  }, [filters, searchTerm, sortBy, sortOrder]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSeverityClass = (severity) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'validated':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'escalated':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'resolved':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'illegal_cutting', label: 'Illegal Cutting' },
    { value: 'land_reclamation', label: 'Land Reclamation' },
    { value: 'pollution', label: 'Pollution' },
    { value: 'dumping', label: 'Dumping' },
    { value: 'construction', label: 'Construction' },
    { value: 'other', label: 'Other' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'validated', label: 'Validated' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'escalated', label: 'Escalated' },
    { value: 'resolved', label: 'Resolved' }
  ];

  const severityOptions = [
    { value: '', label: 'All Severities' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              View and manage all incident reports from the community
            </p>
          </div>
          <Link 
            to="/reports/submit" 
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Report</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="form-input pl-10 w-full"
                  placeholder="Search reports by title, description, or location..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <button
                  className="btn-outline flex items-center justify-center space-x-2"
                  onClick={() => document.getElementById('filtersCollapse').classList.toggle('hidden')}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <div id="filtersCollapse" className="hidden mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Severity</label>
                <select
                  name="severity"
                  value={filters.severity}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  {severityOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Range</label>
                <select
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                  className="form-select w-full"
                >
                  {dateRangeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="card">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <LoadingSpinner />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-red-500 dark:text-red-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="text-center p-8 text-gray-500 dark:text-gray-400">
              <p>No reports found. Adjust your filters or create a new report.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('title')}
                        className="flex items-center space-x-1 focus:outline-none"
                      >
                        <span>Title</span>
                        {sortBy === 'title' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('category')}
                        className="flex items-center space-x-1 focus:outline-none"
                      >
                        <span>Category</span>
                        {sortBy === 'category' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('severity')}
                        className="flex items-center space-x-1 focus:outline-none"
                      >
                        <span>Severity</span>
                        {sortBy === 'severity' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('status')}
                        className="flex items-center space-x-1 focus:outline-none"
                      >
                        <span>Status</span>
                        {sortBy === 'status' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('location')}
                        className="flex items-center space-x-1 focus:outline-none"
                      >
                        <span>Location</span>
                        {sortBy === 'location' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center space-x-1 focus:outline-none"
                      >
                        <span>Date</span>
                        {sortBy === 'date' && (
                          <ArrowUpDown className="h-4 w-4" />
                        )}
                      </button>
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{report.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{report.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white capitalize">{report.category.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(report.severity)}`}>
                          {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(report.status)}`}>
                          {report.status.replace(/_/g, ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span>{report.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <span>{formatDate(report.date)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          to={`/reports/${report.id}`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 inline-flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockReports = [
  {
    id: '1',
    title: 'Illegal Mangrove Cutting at Eastern Coast',
    description: 'Large scale cutting of mangroves observed near the eastern coastal area. Several trees have been cut down and there are signs of machinery being used.',
    category: 'illegal_cutting',
    severity: 'high',
    status: 'under_review',
    location: 'Eastern Coast, Sector 12',
    date: '2023-06-15T10:30:00Z',
    reporter: {
      id: '101',
      name: 'John Smith'
    }
  },
  {
    id: '2',
    title: 'Chemical Waste Dumping',
    description: 'Industrial waste being dumped in the mangrove area. The water appears discolored and there is a strong chemical smell in the vicinity.',
    category: 'pollution',
    severity: 'critical',
    status: 'escalated',
    location: 'Northern Bay, Industrial Zone',
    date: '2023-07-22T15:45:00Z',
    reporter: {
      id: '102',
      name: 'Maria Rodriguez'
    }
  },
  {
    id: '3',
    title: 'Construction Near Protected Mangrove',
    description: 'Construction activity observed very close to protected mangrove area. Debris and construction materials are being placed in the buffer zone.',
    category: 'construction',
    severity: 'medium',
    status: 'validated',
    location: 'Southern Mangrove Reserve',
    date: '2023-08-05T09:15:00Z',
    reporter: {
      id: '103',
      name: 'Ahmed Khan'
    }
  },
  {
    id: '4',
    title: 'Land Reclamation Project Impact',
    description: 'A land reclamation project is affecting water flow to a significant mangrove area. Signs of stress observed in many trees.',
    category: 'land_reclamation',
    severity: 'high',
    status: 'pending',
    location: 'Western Coast Development Zone',
    date: '2023-09-10T14:20:00Z',
    reporter: {
      id: '104',
      name: 'Sarah Johnson'
    }
  },
  {
    id: '5',
    title: 'Plastic Waste Accumulation',
    description: 'Large amounts of plastic waste accumulated among mangrove roots. Wildlife appears to be affected and entangled in the debris.',
    category: 'dumping',
    severity: 'medium',
    status: 'resolved',
    location: 'Central Bay Tourism Area',
    date: '2023-10-03T11:50:00Z',
    reporter: {
      id: '105',
      name: 'Michael Chen'
    }
  },
  {
    id: '6',
    title: 'Suspicious Activity Near Mangroves',
    description: 'Group of individuals observed in restricted mangrove area during night hours. Possible illegal activity.',
    category: 'other',
    severity: 'low',
    status: 'rejected',
    location: 'Restricted Zone, Eastern Reserve',
    date: '2023-11-18T22:10:00Z',
    reporter: {
      id: '106',
      name: 'Lisa Wong'
    }
  }
];

export default ReportsPage;
