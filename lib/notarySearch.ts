/**
 * Notary search utilities for server-side spatial queries
 * Provides optimized location-based search with PostGIS
 */
import type { Database } from '@/lib/supabase';
import { SearchFilters } from '@/components/notary/NotarySearchForm';
import { createServerClient } from '@/lib/supabase/server';

// Type for search parameters
export interface NotarySearchParams {
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
export interface NotarySearchResult {
  notaries: Database['public']['Tables']['notaries']['Row'][];
  totalCount: number;
  page: number;
  totalPages: number;
  radiusMiles: number;
}

/**
 * Client-side fallback search for when PostGIS is unavailable
 * This uses the Supabase client but filters results in-memory
 */
export async function searchNotariesClientSide(params: NotarySearchParams): Promise<NotarySearchResult> {
  // Get Supabase client from our utility
  const supabase = createServerClient();
  
  try {
    // Fetch all notaries for the directory
    const { data, error } = await supabase
      .from('notaries_new')
      .select('*')
      .eq('directory_slug', params.directorySlug);
      
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    if (!data || data.length === 0) {
      return {
        notaries: [],
        totalCount: 0,
        page: params.page || 0,
        totalPages: 0,
        radiusMiles: params.radiusMiles
      };
    }
    
    // Client-side distance calculation and filtering
    let filteredData = data;
    
    // Step 1: Filter by distance
    if (params.latitude && params.longitude && params.radiusMiles) {
      filteredData = data.filter(notary => {
        if (!notary.latitude || !notary.longitude) return false;
        
        const distance = calculateDistance(
          params.latitude,
          params.longitude,
          notary.latitude,
          notary.longitude
        );
        
        // Add distance for sorting and display
        (notary as any).distance = distance;
        return distance <= params.radiusMiles;
      });
    }
    
    // Step 2: Filter by service type if specified
    if (params.serviceType) {
      filteredData = filteredData.filter(
        notary => notary.services && notary.services.includes(params.serviceType!)
      );
    }
    
    // Step 3: Filter by minimum rating if specified
    if (params.minimumRating) {
      filteredData = filteredData.filter(
        notary => notary.rating >= params.minimumRating!
      );
    }
    
    // Sort by distance (nearest first)
    filteredData.sort((a, b) => (a as any).distance - (b as any).distance);
    
    // Handle pagination
    const page = params.page || 0;
    const pageSize = params.pageSize || 10;
    const totalCount = filteredData.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = page * pageSize;
    
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
    
    return {
      notaries: paginatedData,
      totalCount,
      page,
      totalPages,
      radiusMiles: params.radiusMiles
    };
  } catch (error) {
    console.error('Error in client-side notary search:', error);
    return {
      notaries: [],
      totalCount: 0,
      page: params.page || 0,
      totalPages: 0,
      radiusMiles: params.radiusMiles
    };
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadiusKm = 6371;
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = earthRadiusKm * c;
  const distanceMiles = distanceKm * 0.621371;
  
  return distanceMiles;
}

function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Search for notaries using server-side spatial queries via PostGIS
 * This provides much better performance than client-side filtering
 */
export async function searchNotariesWithPostGIS(params: NotarySearchParams): Promise<NotarySearchResult> {
  try {
    // Get Supabase client from our utility
    const supabase = createServerClient();
    
    // Convert miles to meters for PostGIS (1 mile = 1609.34 meters)
    const radiusMeters = params.radiusMiles * 1609.34;
    
    // Get pagination parameters
    const page = params.page || 0;
    const pageSize = params.pageSize || 10;
    
    // Skip value for pagination
    const skip = page * pageSize;
    
    console.log('PostGIS search with params:', {
      lat: params.latitude,
      lng: params.longitude,
      radiusMiles: params.radiusMiles,
      directorySlug: params.directorySlug,
      serviceType: params.serviceType
    });
    
    // If PostGIS is available, use spatial query
    let query = supabase
      .from('notaries_new')
      .select('*', { count: 'exact' })
      .eq('directory_slug', params.directorySlug);
      
    // Add filters
    if (params.serviceType) {
      query = query.contains('services', [params.serviceType]);
    }
    
    if (params.minimumRating) {
      query = query.gte('rating', params.minimumRating);
    }
    
    // Filter by distance using PostGIS ST_DWithin
    if (params.latitude && params.longitude) {
      // Create PostGIS point as a string
      const point = `ST_SetSRID(ST_MakePoint(${params.longitude}, ${params.latitude}), 4326)::geography`;
      
      // We need to use the raw SQL with ST_DWithin for proper distance filtering
      // TypeScript doesn't handle the 4th parameter properly with the Supabase types
      // Using .filter('...', '...', '...') for proper typing
      query = query.filter(`ST_DWithin(location, ${point}, ${radiusMeters})`, 'is', 'true');
      
      // Order by distance
      query = query.order('location', {
        ascending: true,
      });
    } else {
      // If no coordinates, sort by rating
      query = query.order('rating', { ascending: false });
    }
    
    // Apply pagination
    const { data, error, count } = await query
      .range(skip, skip + pageSize - 1);
    
    if (error) {
      console.error('Error in spatial query:', error);
      // Fallback to client-side filtering if PostGIS query fails
      return searchNotariesClientSide(params);
    }
    
    // Calculate total pages
    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // Return results
    return {
      notaries: data || [],
      totalCount,
      page,
      totalPages,
      radiusMiles: params.radiusMiles
    };
  } catch (error) {
    console.error('Error in spatial notary search:', error);
    return searchNotariesClientSide(params);
  }
}

/**
 * Convert search form filters to search parameters for the API
 */
export function createSearchParams(
  coordinates: { latitude: number; longitude: number },
  filters: SearchFilters,
  directorySlug: string,
  page = 0
): NotarySearchParams {
  return {
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    radiusMiles: filters.maxDistance || 20,
    serviceType: filters.serviceType || undefined,
    minimumRating: filters.minimumRating ? 3.5 : undefined,
    page,
    pageSize: 10,
    directorySlug
  };
}
