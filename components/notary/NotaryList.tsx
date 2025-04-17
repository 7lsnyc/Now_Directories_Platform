'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import { kmToMiles, milesToKm, calculateDistance } from '@/utils/geocoding';
import { Directory, DirectoryThemeColors } from '@/types/directory';
import { useSupabase } from '@/lib/supabase/clientProvider';
import { SearchFilters } from './NotarySearchForm';

// Types
type Notary = Database['public']['Tables']['notaries']['Row'];

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NotaryListProps {
  slug: string;
  directoryData: Directory | null;
  themeColors: DirectoryThemeColors;
  searchParams: {
    coordinates: Coordinates;
    filters: SearchFilters;
  } | null;
  onLoadingChange?: (loading: boolean) => void;
}

/**
 * NotaryList component with geolocation-enhanced search
 * Displays notary results based on search parameters
 */
export default function NotaryList({ 
  slug = 'notaryfindernow',
  directoryData,
  themeColors,
  searchParams,
  onLoadingChange
}: NotaryListProps) {
  // State
  const [notaries, setNotaries] = useState<Notary[]>([]);
  const [filteredNotaries, setFilteredNotaries] = useState<Notary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uniqueServices, setUniqueServices] = useState<string[]>([]);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({ 
    serviceType: '', 
    minimumRating: false, 
    maxDistance: 20 
  });
  
  // Track the last used coordinates for debugging
  const lastCoordinatesRef = useRef<Coordinates | null>(null);
  
  // Use the Supabase hook from the new provider
  const { supabase, isLoading: supabaseLoading } = useSupabase();
  
  console.log('[SEARCH-DEBUG] NotaryList rendered with slug:', slug, 'searchParams:', searchParams);

  // Check for notary data availability
  useEffect(() => {
    // Only proceed when Supabase client is ready
    if (!supabase || supabaseLoading) return;
    
    const checkNotaryData = async () => {
      try {
        const { data, error, count } = await supabase
          .from('notaries')
          .select('*', { count: 'exact' })
          .eq('directory_slug', slug);
        
        if (error) {
          console.error(`Error fetching notary data for ${slug}:`, error.message);
        } else if (!data || data.length === 0) {
          console.warn(`No notary data found for directory: ${slug}`);
        } else {
          console.log(`[SEARCH-DEBUG] Found ${count} notaries in the database for ${slug}`);
        }
      } catch (err) {
        console.error('Error in initial data check:', err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    checkNotaryData();
  }, [supabase, supabaseLoading, slug]);

  // Load available service types for the filter dropdown
  useEffect(() => {
    // Only proceed when Supabase client is ready
    if (!supabase || supabaseLoading) return;
    
    const loadAvailableServices = async () => {
      try {
        const { data, error } = await supabase
          .from('notaries')
          .select('services')
          .eq('directory_slug', slug);
        
        if (error) {
          console.error('Error loading services:', error.message);
          return;
        }
        
        if (data && data.length > 0) {
          const allServices = data
            .flatMap(notary => notary.services || [])
            .filter(Boolean) as string[];
          
          const uniqueServicesList = allServices.filter((service, index, self) => 
            self.indexOf(service) === index
          );
          setUniqueServices(uniqueServicesList);
          console.log('[SEARCH-DEBUG] Loaded available services:', uniqueServicesList);
        }
      } catch (err) {
        console.error('Error loading service types:', err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    loadAvailableServices();
  }, [supabase, supabaseLoading, slug]);

  /**
   * Fetches and filters notaries based on coordinates and filters.
   * Uses server-side PostGIS spatial queries for performance.
   */
  const performSearch = useCallback(async (coordinates: Coordinates | null, filters: SearchFilters) => {
    // Ensure coordinates are provided before proceeding
    if (!coordinates) {
      console.warn('[SEARCH-DEBUG] performSearch: No coordinates provided.');
      setError('Cannot search without valid coordinates.');
      setLoading(false);
      onLoadingChange?.(false);
      setSearchPerformed(true); // Mark as attempted
      setFilteredNotaries([]); // Clear results
      return;
    }

    // Ensure Supabase client is available
    if (!supabase) {
      console.error('[SEARCH-DEBUG] performSearch: Supabase client not ready.');
      setError('Database connection not ready. Please wait a moment.');
      setLoading(false);
      onLoadingChange?.(false);
      setSearchPerformed(true); // Mark as attempted even if client wasn't ready
      setFilteredNotaries([]); // Clear results if client fails
      return;
    }

    console.log('[SEARCH-DEBUG] NotaryList.performSearch executing with:', { coordinates, filters });
    setLoading(true);
    onLoadingChange?.(true);
    setError(null);
    setFilteredNotaries([]); // Clear previous results before new search

    try {
      console.log('[SEARCH-DEBUG] Executing PostGIS spatial query with parameters:', {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        radius_miles: filters.maxDistance,
        dir_slug: slug,
        min_rating: filters.minimumRating ? 3.5 : null,
        service_type: filters.serviceType || null
      });

      // Call the database function directly using RPC
      // This offloads all spatial calculations to the database
      const { data, error: queryError } = await supabase.rpc('nearby_notaries', {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        radius_miles: filters.maxDistance,
        dir_slug: slug,
        min_rating: filters.minimumRating ? 3.5 : null,
        service_type: filters.serviceType || null
      });

      if (queryError) {
        // Throw query errors to be caught by the main catch block
        console.error('[SEARCH-DEBUG] Database function error:', queryError);
        throw queryError;
      }

      if (!data || data.length === 0) {
        console.log('[SEARCH-DEBUG] No matching notaries found within radius.');
        setFilteredNotaries([]);
      } else {
        console.log(`[SEARCH-DEBUG] Found ${data.length} notaries within ${filters.maxDistance} miles`);
        
        // Process the results - convert distance_meters to miles for display
        const notariesWithMiles = data.map((notary: any) => ({
          ...notary,
          // Convert meters to miles for display
          distance: notary.distance_meters / 1609.34
        }));
        
        // No need to filter by distance or sort - the database already did that
        setFilteredNotaries(notariesWithMiles);
        
        // Save all matched results for potential broader searches
        setNotaries(notariesWithMiles);
      }
    } catch (err) {
      console.error('[SEARCH-DEBUG] Supabase RPC Error Object:', err);
      
      // Set a user-friendly error message
      setError(err instanceof Error 
        ? `Search failed: ${err.message}` 
        : 'An error occurred while searching for notaries. Please try again.');
        
      setFilteredNotaries([]); // Clear results on error
    } finally {
      setLoading(false);
      onLoadingChange?.(false);
      setSearchPerformed(true); // Mark search as completed (or attempted)
    }
  }, [supabase, slug, onLoadingChange]);

  // useEffect to trigger search when parameters change
  useEffect(() => {
    console.log('[SEARCH-DEBUG] NotaryList useEffect triggered. searchParams:', searchParams, 'supabase ready:', !!supabase);
    
    if (searchParams && searchParams.coordinates && supabase) {
      // Save the coordinates for comparison in future searches
      lastCoordinatesRef.current = searchParams.coordinates;
      
      // Update current filters for display
      setCurrentFilters(searchParams.filters);
      
      // Start loading state
      setLoading(true);
      if (onLoadingChange) onLoadingChange(true);
      
      // Execute search with the new parameters
      performSearch(searchParams.coordinates, searchParams.filters);
    } else if (searchParams === null) {
      // Handle initial state or cleared search
      setFilteredNotaries([]);
      setSearchPerformed(false);
      setError(null);
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    } else if (searchParams && !searchParams.coordinates) {
      // Handle case where search was requested without coordinates
      console.warn("[SEARCH-DEBUG] Search requested but no coordinates available.");
      setFilteredNotaries([]);
      setSearchPerformed(true);
      setError("Please provide a valid location for the search.");
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    } else if (!supabase) {
      // Handle case where Supabase client failed to initialize
      setError("Database connection unavailable. Please refresh.");
      setFilteredNotaries([]);
      setSearchPerformed(true);
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [searchParams, supabase, performSearch, onLoadingChange]);

  // Primary color for UI elements
  const primaryColor = themeColors?.primary || '#3B82F6';
  const textColor = themeColors?.primaryText || 'white';

  // Show loading state while Supabase initializes
  if (supabaseLoading) {
    return (
      <div className="p-6 text-center">
        <div 
          className="inline-block animate-spin h-8 w-8 border-4 rounded-full" 
          style={{ 
            borderColor: `${primaryColor} transparent transparent transparent` 
          }}
        ></div>
        <p className="mt-2">Loading notary search...</p>
      </div>
    );
  }

  // Show error if Supabase client is not available
  if (!supabase) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-md text-red-700">
        <h3 className="font-bold text-lg">Connection Error</h3>
        <p>There was a problem connecting to our database. Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Section */}
      <div>
        {loading && (
          <div className="p-4 text-center">
            <div 
              className="inline-block animate-spin h-8 w-8 border-4 rounded-full" 
              style={{ 
                borderColor: `${primaryColor} transparent transparent transparent` 
              }}
            ></div>
            <p className="mt-2">Loading results...</p>
          </div>
        )}
        
        {!loading && error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}
        
        {!loading && !searchPerformed && !searchParams && (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-center">
            <p className="text-lg font-medium">Enter a location to find notaries near you</p>
            <p className="mt-2">Use the search form above to find notaries in your area.</p>
          </div>
        )}
        
        {!loading && searchPerformed && filteredNotaries.length === 0 && (
          <div className="p-6 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-center">
            <p className="text-lg font-medium">No notaries found in your area</p>
            <p className="mt-2">Try adjusting your filters or searching a different location.</p>
            <p className="mt-1 text-sm text-gray-500">
              {notaries.length > 0 ? 
                `Found ${notaries.length} notaries, but none within ${currentFilters.maxDistance || 20} miles.` : 
                'No notaries found in the database for this directory.'}
            </p>
          </div>
        )}
        
        {!loading && filteredNotaries.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              Found {filteredNotaries.length} notaries near you
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotaries.map((notary) => (
                <div 
                  key={notary.id} 
                  className="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  data-testid="notary-card"
                >
                  <h3 className="font-bold text-lg">{notary.name}</h3>
                  <div className="text-sm text-gray-600 mb-2">
                    {notary.city}, {notary.state} {notary.zip}
                  </div>
                  
                  {/* Distance */}
                  {'distance' in notary && (
                    <div className="text-sm font-medium" style={{ color: primaryColor }}>
                      {(notary.distance as number).toFixed(1)} miles away
                    </div>
                  )}
                  
                  {/* Rating */}
                  <div className="mt-2 flex items-center">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{notary.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-gray-500 text-sm ml-2">
                      ({notary.review_count} reviews)
                    </span>
                  </div>
                  
                  {/* Services */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {notary.services?.slice(0, 3).map((service, index) => (
                      <span 
                        key={index} 
                        className="text-white text-xs px-2 py-1 rounded"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {service}
                      </span>
                    ))}
                    {notary.services && notary.services.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{notary.services.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
