import React, { useState } from 'react';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield, 
  Activity,
  TrendingUp,
  MapPin,
  AlertTriangle,
  CheckCircle,
  BookOpen
} from 'lucide-react';
import CommunityManagement from '../../components/Admin/CommunityManagement';
import CommunitiesManagement from '../../components/Admin/CommunitiesManagement';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'communities', name: 'Communities', icon: Users },
    { id: 'community', name: 'Content Management', icon: BookOpen },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'reports', name: 'Reports', icon: FileText },
    { id: 'system', name: 'System Settings', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'communities':
        return <CommunitiesManagement />;
      case 'community':
        return <CommunityManagement />;
      case 'dashboard':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">1,234</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Reports</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">567</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <MapPin className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mangrove Areas</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">89</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-white">456</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-gray-600 dark:text-gray-400">New user registration: John Doe</span>
                  <span className="text-sm text-gray-400">2 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="text-gray-600 dark:text-gray-400">New report submitted: Pollution incident</span>
                  <span className="text-sm text-gray-400">15 minutes ago</span>
                </div>
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  <span className="text-gray-600 dark:text-gray-400">System maintenance scheduled</span>
                  <span className="text-sm text-gray-400">1 hour ago</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Admin Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Administrative tools and system management.
        </p>
        
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
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
    </div>
  );
};

export default AdminPage;
