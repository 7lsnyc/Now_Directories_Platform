/**
 * Client-side provider search utilities
 * Safe to import in client components
 */
import { getProviderConfigFromSlug } from '@/types/provider';

// Types to support the search for any provider type
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Type for search filters
export interface SearchFilters {
  serviceType: string;
  minimumRating: boolean;
  maxDistance: number; // Maximum distance in miles
}

// Type for search parameters
export interface ProviderSearchParams {
  latitude: number;
  longitude: number;
  radiusMiles: number;
  serviceType?: string;
  minimumRating?: number;
  page?: number;
  pageSize?: number;
  directorySlug: string;
}

// Type for search results
export interface ProviderSearchResult {
  providers: any[]; // Using any since provider types can vary
  totalCount: number;
  page: number;
  totalPages: number;
  radiusMiles: number;
}

/**
 * Helper function to calculate distance between two geographic coordinates
 * Returns distance in miles
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8; // Earth's radius in miles
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

/**
 * Helper function to convert degrees to radians
 */
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Convert search form filters to search parameters for the API
 */
export function createSearchParams(
  coordinates: Coordinates,
  filters: SearchFilters,
  directorySlug: string,
  page = 0,
  pageSize = 50
): ProviderSearchParams {
  // Get provider configuration for this directory
  const providerConfig = getProviderConfigFromSlug(directorySlug);
  
  // Use defaults from provider configuration
  const defaultRadius = providerConfig.defaults.radius;
  const defaultMinimumRating = providerConfig.defaults.minimumRating;
  
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    radiusMiles: filters.maxDistance || defaultRadius,
    serviceType: filters.serviceType || undefined,
    minimumRating: filters.minimumRating ? defaultMinimumRating : undefined,
    page,
    pageSize,
    directorySlug
  };
}
