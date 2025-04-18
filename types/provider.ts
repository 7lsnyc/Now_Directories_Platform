/**
 * Provider type definitions for the Now Directories platform
 * These types enable a generalized approach to different service provider types
 * across multiple directory instances.
 */

/**
 * Provider type configuration interface that abstracts provider-specific details
 * This allows the application to support multiple provider types (notaries, lawyers, etc.)
 * with minimal code duplication.
 */
export interface ProviderTypeConfig {
  // Provider type identifier (e.g., "notary", "lawyer", "plumber")
  type: string;
  
  // Database table name to use for this provider type
  tableName: string;
  
  // UI labels for this provider type
  labels: {
    singular: string;      // e.g., "Notary"
    plural: string;        // e.g., "Notaries"
    searchTitle: string;   // e.g., "Find Notaries Near You"
    serviceLabel: string;  // e.g., "Service Type"
    noResultsText: string; // e.g., "No notaries found in your area"
  };
  
  // Default filters for this provider type
  defaults: {
    radius: number;         // Default search radius in miles
    minimumRating: number;  // Default minimum rating threshold
    maxResults: number;     // Default maximum number of results to show
  };
  
  // Field mappings for provider-specific database fields
  fields: {
    // Map generic field concepts to provider-specific field names
    specializations: string; // Field name for specializations/services (e.g., "services", "practice_areas")
    location: string;        // Field name for geolocation data (e.g., "location", "geo_point")
  };
  
  // Feature flags for provider type
  features: {
    hasSpecializations: boolean; // Whether the provider type has specializations/services
    hasRatings: boolean;         // Whether the provider type supports ratings
    hasHours: boolean;           // Whether the provider type has operating hours
    hasVerification: boolean;    // Whether the provider type has verified status
  };
}

/**
 * Map directory slugs to provider types
 * This allows multiple directory slugs to use the same provider type configuration
 */
export const directoryToProviderMap: Record<string, string> = {
  'notaryfindernow': 'notary',
  'lawyerfindernow': 'lawyer',
  // Add more mappings as needed for future directories
};

/**
 * Provider type configurations
 * Contains all the configurations for different provider types supported by the platform
 */
export const providerConfigs: Record<string, ProviderTypeConfig> = {
  'notary': {
    type: 'notary',
    tableName: 'notaries_new',
    labels: {
      singular: 'Notary',
      plural: 'Notaries',
      searchTitle: 'Find Notaries Near You',
      serviceLabel: 'Service Type',
      noResultsText: 'No notaries found in your area'
    },
    defaults: {
      radius: 20,
      minimumRating: 3.5,
      maxResults: 50
    },
    fields: {
      specializations: 'services',
      location: 'location'
    },
    features: {
      hasSpecializations: true,
      hasRatings: true,
      hasHours: true,
      hasVerification: true
    }
  },
  'lawyer': {
    type: 'lawyer',
    tableName: 'lawyers',
    labels: {
      singular: 'Lawyer',
      plural: 'Lawyers',
      searchTitle: 'Find Lawyers Near You',
      serviceLabel: 'Practice Area',
      noResultsText: 'No lawyers found in your area'
    },
    defaults: {
      radius: 30,
      minimumRating: 4.0,
      maxResults: 50
    },
    fields: {
      specializations: 'practice_areas',
      location: 'location'
    },
    features: {
      hasSpecializations: true,
      hasRatings: true,
      hasHours: false,
      hasVerification: true
    }
  },
};

/**
 * Get provider configuration from directory slug
 * 
 * @param slug - The directory slug to get provider configuration for
 * @returns The provider configuration for the given directory slug
 */
export function getProviderConfigFromSlug(slug: string): ProviderTypeConfig {
  const providerType = directoryToProviderMap[slug] || 'default';
  return providerConfigs[providerType] || providerConfigs['notary']; // Fallback to notary
}

/**
 * Get provider database table name from directory slug
 * 
 * @param slug - The directory slug to get database table name for
 * @returns The database table name for the provider type
 */
export function getProviderTableName(slug: string): string {
  return getProviderConfigFromSlug(slug).tableName;
}

/**
 * Check if a directory slug has a registered provider type
 * 
 * @param slug - The directory slug to check
 * @returns Whether the directory slug has a registered provider type
 */
export function isValidProviderSlug(slug: string): boolean {
  return Boolean(directoryToProviderMap[slug]);
}
