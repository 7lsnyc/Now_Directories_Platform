/**
 * SERVER-SIDE ONLY Provider search functions
 * This file should not be imported in client components
 */
import { createServerClient } from '@/lib/supabase/server';
import { getProviderConfigFromSlug } from '@/types/provider';
import { 
  Coordinates, 
  SearchFilters, 
  ProviderSearchParams, 
  ProviderSearchResult,
  calculateDistance,
  degreesToRadians
} from './providerSearchClient';

/**
 * Search for providers using server-side spatial queries via PostGIS
 * This provides much better performance than client-side filtering
 */
export async function searchProvidersWithPostGIS(params: ProviderSearchParams): Promise<ProviderSearchResult> {
  try {
    // LOGGING POINT 1: Log incoming search parameters
    console.log('🔍 SERVER SEARCH - INCOMING PARAMETERS:', {
      latitude: params.latitude,
      longitude: params.longitude,
      radiusMiles: params.radiusMiles,
      serviceType: params.serviceType || 'None',
      minimumRating: params.minimumRating || 'Not Applied',
      directorySlug: params.directorySlug,
      page: params.page || 0,
      pageSize: params.pageSize || 10
    });
    
    // Get Supabase client from our utility
    const supabase = createServerClient();
    
    // Get provider configuration for this directory
    const providerConfig = getProviderConfigFromSlug(params.directorySlug);
    const tableName = providerConfig.tableName;
    const specializationField = providerConfig.fields.specializations;
    const locationField = providerConfig.fields.location;
    
    // LOGGING POINT 2: Log provider configuration
    console.log('🔍 SERVER SEARCH - PROVIDER CONFIG:', {
      providerType: providerConfig.type,
      tableName,
      specializationField,
      locationField
    });
    
    // Convert miles to meters for PostGIS (1 mile = 1609.34 meters)
    const radiusMeters = params.radiusMiles * 1609.34;
    
    // Get pagination parameters
    const page = params.page || 0;
    const pageSize = params.pageSize || 10;
    
    // LOGGING POINT 3: Log RPC call details
    console.log('🔍 SERVER SEARCH - CALLING RPC FUNCTION:', {
      function: 'nearby_providers',
      parameters: {
        search_lat: params.latitude,
        search_lon: params.longitude,
        radius_meters: radiusMeters,
        dir_slug: params.directorySlug,
        service_type: params.serviceType || null,
        minimum_rating: params.minimumRating || null,
        page_size: pageSize,
        page_number: page
      }
    });
    
    // Call the PostgreSQL function via RPC instead of building complex filters
    const { data, error } = await supabase.rpc('nearby_providers', {
      search_lat: params.latitude,
      search_lon: params.longitude,
      radius_meters: radiusMeters,
      dir_slug: params.directorySlug,
      service_type: params.serviceType || null,
      minimum_rating: params.minimumRating || null,
      page_size: pageSize,
      page_number: page
    });
    
    // LOGGING POINT 4: Log raw RPC response
    console.log('🔍 SERVER SEARCH - RPC RESPONSE:', {
      success: !error,
      responseType: data ? typeof data : 'null',
      errorMessage: error ? error.message : null,
      errorCode: error ? error.code : null
    });
    
    if (error) {
      console.error('Error in RPC call:', error);
      throw error;
    }
    
    if (!data || typeof data !== 'object') {
      console.error('Invalid response from RPC call:', data);
      throw new Error('Invalid response format from database function');
    }
    
    // Extract providers and total count from the response
    const providers = data.items || [];
    const totalCount = data.total_count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);
    
    // LOGGING POINT 5: Log final results
    console.log('🔍 SERVER SEARCH - RETURNING RESULTS:', {
      providersReturned: providers.length,
      totalMatching: totalCount,
      page,
      totalPages,
      searchRadiusMiles: params.radiusMiles
    });
    
    // Return results in the expected format
    return {
      providers,
      totalCount,
      page,
      totalPages,
      radiusMiles: params.radiusMiles
    };
  } catch (error) {
    console.error('Error in spatial provider search:', error);
    throw error;
  }
}
