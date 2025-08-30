import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { FEATURES_BY_ROLE } from '../../utils/rolePermissions';

const DashboardHeader = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const features = FEATURES_BY_ROLE[user?.role] || {};

  return (
    <header className="flex items-center justify-between p-4 bg-bg-primary border-b border-border-color">
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-bg-secondary"
        >
          <Menu className="w-6 h-6 text-text-primary" />
        </button>
        <h1 className="text-xl font-semibold text-text-primary">Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-bg-secondary transition-colors duration-200"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-text-primary" />
          ) : (
            <Moon className="w-5 h-5 text-text-primary" />
          )}
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
