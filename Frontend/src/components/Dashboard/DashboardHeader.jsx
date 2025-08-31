import React from "react";

const DashboardHeader = ({
  timeFilter,
  setTimeFilter,
  regionFilter,
  setRegionFilter,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">Time:</label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="px-3 py-1 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-300">Region:</label>
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="px-3 py-1 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">All Regions</option>
              <option value="north">North Coast</option>
              <option value="south">South Coast</option>
              <option value="east">East Coast</option>
              <option value="west">West Coast</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
