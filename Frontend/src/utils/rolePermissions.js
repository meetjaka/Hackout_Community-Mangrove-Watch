// Role-based permissions configuration
const ROLE_PERMISSIONS = {
  COASTAL_COMMUNITY: [
    'submit_report',
    'view_reports',
    'comment_reports',
    'view_leaderboard',
    'earn_points',
    'access_educational_content',
    'participate_forums'
  ],
  
  NGO_STAFF: [
    'submit_report',
    'view_reports',
    'verify_reports',
    'comment_reports',
    'view_leaderboard',
    'earn_points',
    'access_educational_content',
    'participate_forums',
    'view_analytics',
    'manage_community_events',
    'access_satellite_data'
  ],
  
  GOVERNMENT_OFFICIAL: [
    'submit_report',
    'view_reports',
    'verify_reports',
    'comment_reports',
    'view_leaderboard',
    'access_educational_content',
    'participate_forums',
    'view_analytics',
    'manage_users',
    'access_satellite_data',
    'generate_reports',
    'enforce_actions',
    'view_sensitive_data'
  ],
  
  RESEARCHER: [
    'submit_report',
    'view_reports',
    'comment_reports',
    'view_leaderboard',
    'access_educational_content',
    'participate_forums',
    'view_analytics',
    'access_satellite_data',
    'export_data',
    'run_analysis',
    'view_historical_data'
  ]
};

// Feature access configuration
const FEATURES_BY_ROLE = {
  COASTAL_COMMUNITY: {
    dashboard: ['my_reports', 'nearby_incidents', 'leaderboard', 'educational_content'],
    reports: ['submit', 'view', 'comment'],
    community: ['forums', 'events', 'resources'],
    gamification: ['points', 'badges', 'achievements']
  },
  
  NGO_STAFF: {
    dashboard: ['my_reports', 'nearby_incidents', 'leaderboard', 'analytics', 'verification_queue'],
    reports: ['submit', 'view', 'verify', 'comment', 'manage'],
    community: ['forums', 'events', 'resources', 'manage_events'],
    gamification: ['points', 'badges', 'achievements'],
    analytics: ['basic_reports', 'trends', 'impact_assessment'],
    satellite: ['view_data', 'change_detection']
  },
  
  GOVERNMENT_OFFICIAL: {
    dashboard: ['all_reports', 'analytics', 'enforcement_actions', 'alerts'],
    reports: ['submit', 'view', 'verify', 'comment', 'manage', 'enforce'],
    community: ['forums', 'events', 'resources', 'manage_all'],
    gamification: ['manage_rewards'],
    analytics: ['advanced_reports', 'trends', 'predictions', 'enforcement_stats'],
    satellite: ['view_data', 'change_detection', 'historical_analysis'],
    admin: ['user_management', 'system_settings', 'data_export']
  },
  
  RESEARCHER: {
    dashboard: ['research_overview', 'data_analysis', 'export_tools'],
    reports: ['submit', 'view', 'comment', 'analyze'],
    community: ['forums', 'events', 'resources', 'publish_research'],
    analytics: ['advanced_reports', 'trends', 'predictions', 'custom_analysis'],
    satellite: ['view_data', 'change_detection', 'historical_analysis', 'custom_algorithms'],
    research: ['data_export', 'analysis_tools', 'api_access']
  }
};

// Permission checking function
const hasPermission = (userRole, permission) => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

// Feature access checking function
const hasFeatureAccess = (userRole, feature, subFeature) => {
  return FEATURES_BY_ROLE[userRole]?.[feature]?.includes(subFeature) || false;
};

export { ROLE_PERMISSIONS, FEATURES_BY_ROLE, hasPermission, hasFeatureAccess };
