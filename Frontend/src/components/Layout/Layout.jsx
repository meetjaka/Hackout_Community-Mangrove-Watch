import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { 
  Menu, 
  X, 
  Sun, 
  Moon, 
  MapPin, 
  Shield, 
  Users, 
  BarChart3, 
  Trophy,
  LogOut,
  User,
  Settings
} from 'lucide-react';
import LoadingSpinner from '../UI/LoadingSpinner';

const Layout = ({ children }) => {
  // Add error handling for auth context
  let auth = { user: null, isAuthenticated: false, loading: false, logout: () => {} };
  try {
    auth = useAuth();
  } catch (error) {
    console.warn('Auth context not available:', error.message);
  }
  
  const { user, isAuthenticated, logout, loading } = auth;
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, requiresAuth: true },
    { name: 'Reports', href: '/reports', icon: Shield, requiresAuth: true },
    { name: 'Community', href: '/community', icon: Users, requiresAuth: true },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, requiresAuth: true },
  ];

  const isActiveRoute = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Only show loading spinner if we're still loading and trying to access a protected route
  if (loading && location.pathname !== '/' && !location.pathname.startsWith('/login') && !location.pathname.startsWith('/register')) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-mangrove-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">
                  Mangrove Watch
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            {isAuthenticated && (
              <nav className="hidden md:flex space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      isActiveRoute(item.href)
                        ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </nav>
            )}

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={() => {
                  console.log('Theme toggle clicked, current theme:', theme);
                  toggleTheme();
                }}
                className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-700 transition-colors duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* User menu */}
              {isAuthenticated ? (
                <div className="relative">
                  <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                        {user?.role}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                        </div>
                        <Menu className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>

                  {/* Dropdown menu */}
                  {mobileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      {/* Only show Admin option for admin roles */}
                      {user && ['super_admin', 'ngo_admin', 'government_officer', 'researcher'].includes(user.role) && (
                        <Link
                          to="/admin"
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin</span>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && isAuthenticated && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActiveRoute(item.href)
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-mangrove-500 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gradient">
                  Community Mangrove Watch
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Empowering communities to protect and monitor mangrove ecosystems through participatory monitoring and citizen science.
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/resources" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Resources
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Connect
              </h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Facebook
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <p className="text-center text-gray-500 dark:text-gray-400">
              © 2024 Community Mangrove Watch. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
