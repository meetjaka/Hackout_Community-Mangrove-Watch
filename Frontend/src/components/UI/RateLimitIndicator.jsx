import React from 'react';
import { Clock } from 'lucide-react';

const RateLimitIndicator = ({ countdown }) => {
  if (!countdown || countdown <= 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 shadow-lg z-50">
      <div className="flex items-center space-x-2">
        <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
        <span className="text-sm font-medium text-yellow-800">
          Please wait {countdown} second{countdown !== 1 ? 's' : ''} before trying again
        </span>
      </div>
      <div className="mt-2 w-full bg-yellow-200 rounded-full h-1">
        <div 
          className="bg-yellow-600 h-1 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${(countdown / 1) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default RateLimitIndicator;
