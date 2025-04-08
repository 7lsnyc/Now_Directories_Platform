/**
 * Notary search utilities for server-side spatial queries
 * Provides optimized location-based search with PostGIS
 */
import type { Database } from '@/lib/supabase';
import { SearchFilters } from '@/components/notary/NotarySearchForm';
import { getSupabaseClient } from '@/lib/supabase/getClient';

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
  const supabase = await getSupabaseClient();
  
  if (!supabase) {
    throw new Error('Unable to initialize Supabase client. Check environment variables.');
  }
  
  // Fetch all notaries for the directory
  const { data, error } = await supabase
    .from('notaries')
    .select('*')
    .eq('directory_slug', params.directorySlug);
  
  if (error) {
    console.error('Error fetching notaries:', error);
    return {
      notaries: [],
      totalCount: 0,
      page: params.page || 0,
      totalPages: 0,
      radiusMiles: params.radiusMiles
    };
  }
  
  // Filter and sort results client-side
  let filteredData = data || [];
  
  // Apply filters
  if (params.serviceType) {
    filteredData = filteredData.filter(notary => 
      notary.services && notary.services.includes(params.serviceType || '')
    );
  }
  
  if (params.minimumRating && typeof params.minimumRating === 'number') {
    filteredData = filteredData.filter(notary => 
      notary.rating >= params.minimumRating!
    );
  }
  
  // Calculate distance and filter by radius if coordinates are provided
  if (params.latitude && params.longitude) {
    filteredData = filteredData.filter(notary => {
      if (!notary.latitude || !notary.longitude) return false;
      
      // Calculate distance using Haversine formula
      const earthRadiusKm = 6371;
      const dLat = degreesToRadians(notary.latitude - params.latitude);
      const dLon = degreesToRadians(notary.longitude - params.longitude);
      
      const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(degreesToRadians(params.latitude)) * Math.cos(degreesToRadians(notary.latitude)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distanceKm = earthRadiusKm * c;
      const distanceMiles = distanceKm * 0.621371;
      
      // Store distance for sorting
      (notary as any).distance = distanceMiles;
      
      return distanceMiles <= params.radiusMiles;
    });
    
    // Sort by distance
    filteredData.sort((a, b) => (a as any).distance - (b as any).distance);
  } else {
    // Sort by rating
    filteredData.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
  
  // Apply pagination
  const page = params.page || 0;
  const pageSize = params.pageSize || 10;
  const startIndex = page * pageSize;
  const totalCount = filteredData.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
  
  return {
    notaries: paginatedData,
    totalCount,
    page,
    totalPages,
    radiusMiles: params.radiusMiles
  };
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
    const supabase = await getSupabaseClient();
    
    if (!supabase) {
      console.error('Unable to initialize Supabase client');
      return searchNotariesClientSide(params);
    }
    
    // Convert miles to meters for PostGIS (1 mile = 1609.34 meters)
    const radiusMeters = params.radiusMiles * 1609.34;
    
    // Pagination parameters (default: page 0, 10 items per page)
    const page = params.page || 0;
    const pageSize = params.pageSize || 10;
    const startIndex = page * pageSize;
    const endIndex = startIndex + pageSize - 1;
    
    // Build the query
    let query = supabase
      .from('notaries')
      .select('*', { count: 'exact' })
      .eq('directory_slug', params.directorySlug);
    
    // Apply spatial filter when coordinates are provided
    if (params.latitude && params.longitude) {
      // ST_DWithin filter: find points within the specified radius
      // ST_MakePoint: creates a PostGIS point from longitude and latitude
      // The third parameter to ST_DWithin is the distance in meters
      query = query.filter(
        'location',
        'st_dwithin',
        `POINT(${params.longitude} ${params.latitude})::geography, ${radiusMeters}`
      );
    }
    
    // Apply service type filter if specified
    if (params.serviceType) {
      query = query.contains('services', [params.serviceType]);
    }
    
    // Apply minimum rating filter if specified
    if (params.minimumRating && typeof params.minimumRating === 'number') {
      query = query.gte('rating', params.minimumRating);
    }
    
    // Add ordering by distance (nearest first) - requires the ST_Distance function
    if (params.latitude && params.longitude) {
      query = query.order(
        `ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint(${params.longitude}, ${params.latitude}), 4326)::geography
        )`,
        { ascending: true }
      );
    } else {
      // Default ordering by rating if no location provided
      query = query.order('rating', { ascending: false });
    }
    
    // Apply pagination
    query = query.range(startIndex, endIndex);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Database error:', error);
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
