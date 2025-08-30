import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  Shield, 
  Users, 
  Trophy, 
  MapPin, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const DashboardPage = () => {
  // Mock data - in real app this would come from API
  const stats = [
    { name: 'Total Reports', value: '1,234', change: '+12%', changeType: 'positive', icon: Shield },
    { name: 'Active Users', value: '5,678', change: '+8%', changeType: 'positive', icon: Users },
    { name: 'Validated Reports', value: '987', change: '+15%', changeType: 'positive', icon: CheckCircle },
    { name: 'Urgent Cases', value: '23', change: '-5%', changeType: 'negative', icon: AlertTriangle },
  ];

  const recentReports = [
    { id: 1, title: 'Illegal mangrove cutting detected', status: 'pending', location: 'Mumbai, India', time: '2 hours ago' },
    { id: 2, title: 'Pollution in coastal waters', status: 'validated', location: 'Chennai, India', time: '4 hours ago' },
    { id: 3, title: 'Land reclamation activity', status: 'investigating', location: 'Kochi, India', time: '6 hours ago' },
  ];

  const quickActions = [
    { name: 'Submit Report', href: '/reports/submit', icon: Shield, color: 'bg-primary-500' },
    { name: 'View Reports', href: '/reports', icon: BarChart3, color: 'bg-success-500' },
    { name: 'Community', href: '/community', icon: Users, color: 'bg-mangrove-500' },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, color: 'bg-warning-500' },
  ];

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with mangrove conservation today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.icon === Shield ? 'bg-primary-100' : stat.icon === Users ? 'bg-success-100' : stat.icon === CheckCircle ? 'bg-mangrove-100' : 'bg-warning-100'}`}>
                  <stat.icon className={`w-6 h-6 ${stat.icon === Shield ? 'text-primary-600' : stat.icon === Users ? 'text-success-600' : stat.icon === CheckCircle ? 'text-mangrove-600' : 'text-warning-600'}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span className={`inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium ${
                  stat.changeType === 'positive' 
                    ? 'bg-success-100 text-success-800' 
                    : 'bg-danger-100 text-danger-800'
                }`}>
                  {stat.change}
                </span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">from last month</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="card p-6 text-center hover:shadow-medium transition-shadow duration-200"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{action.name}</h3>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
            <Link to="/reports" className="text-primary-600 hover:text-primary-500 text-sm font-medium">
              View all reports →
            </Link>
          </div>
          <div className="card">
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Report
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {recentReports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {report.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'pending' 
                            ? 'bg-warning-100 text-warning-800' 
                            : report.status === 'validated' 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-primary-100 text-primary-800'
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {report.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {report.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Map Placeholder */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Incident Heatmap</h2>
          <div className="card p-8 text-center">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Interactive Map Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400">
              View real-time incident locations and heatmaps of mangrove threats in your area.
            </p>
          </div>
        </div>

        {/* Trends Placeholder */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Conservation Trends</h2>
          <div className="card p-8 text-center">
            <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Analytics Dashboard Coming Soon</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track conservation progress, identify trends, and measure the impact of community efforts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
