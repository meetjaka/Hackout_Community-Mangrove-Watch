import React from 'react';

// Skeleton loader for stats cards
export const StatsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          <div className="ml-4 flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-16 animate-pulse"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Skeleton loader for resources section
export const ResourcesSkeleton = () => (
  <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48 animate-pulse"></div>
    </div>
    <div className="px-6 py-4">
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start">
            <div className="flex-1">
              <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-64 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
            </div>
            <div className="ml-4 h-8 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton loader for guidelines section
export const GuidelinesSkeleton = () => (
  <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
      <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-40 animate-pulse"></div>
    </div>
    <div className="px-6 py-4">
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-start">
            <div className="h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full mr-3 mt-0.5 animate-pulse"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-full animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Skeleton loader for call to action section
export const CallToActionSkeleton = () => (
  <div className="mt-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-8 text-center text-white">
    <div className="h-8 bg-white bg-opacity-20 rounded w-48 mx-auto mb-4 animate-pulse"></div>
    <div className="h-4 bg-white bg-opacity-20 rounded w-96 mx-auto mb-6 animate-pulse"></div>
    <div className="flex flex-wrap justify-center gap-4">
      <div className="h-10 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
      <div className="h-10 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
    </div>
  </div>
);

// Skeleton loader for search filters
export const SearchFiltersSkeleton = () => (
  <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
    <div className="flex flex-wrap gap-4">
      <div className="h-10 w-48 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      <div className="h-10 w-32 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
      <div className="h-10 w-24 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
    </div>
  </div>
);

// Main skeleton loader for the entire page
export const CommunityPageSkeleton = () => (
  <div className="container mx-auto px-4 py-8">
    <StatsSkeleton />
    <SearchFiltersSkeleton />
    <ResourcesSkeleton />
    <GuidelinesSkeleton />
    <CallToActionSkeleton />
  </div>
);

export default {
  StatsSkeleton,
  ResourcesSkeleton,
  GuidelinesSkeleton,
  CallToActionSkeleton,
  SearchFiltersSkeleton,
  CommunityPageSkeleton
};
