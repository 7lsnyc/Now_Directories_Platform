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
  setIsLoading?: (isLoading: boolean) => void;
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
  setIsLoading
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
   * Calculate the distance between two coordinate points
   */
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  /**
   * Convert kilometers to miles
   */
  const kmToMiles = (km: number): number => {
    return km * 0.621371;
  };

  /**
   * Convert miles to kilometers
   */
  const milesToKm = (miles: number): number => {
    return miles / 0.621371;
  };

  /**
   * Fetches and filters notaries based on coordinates and filters.
   * Updated to remove the non-existent 'is_active' filter.
   */
  const performSearch = useCallback(async (coordinates: Coordinates | null, filters: SearchFilters) => {
    // Ensure coordinates are provided before proceeding
    if (!coordinates) {
        console.warn('[SEARCH-DEBUG] performSearch: No coordinates provided.');
        setError('Cannot search without valid coordinates.');
        setLoading(false);
        setSearchPerformed(true); // Mark as attempted
        setFilteredNotaries([]); // Clear results
        return;
    }

    // Ensure Supabase client is available
    if (!supabase) {
      console.error('[SEARCH-DEBUG] performSearch: Supabase client not ready.');
      setError('Database connection not ready. Please wait a moment.');
      setLoading(false);
      setSearchPerformed(true); // Mark as attempted even if client wasn't ready
      setFilteredNotaries([]); // Clear results if client fails
      return;
    }

    console.log('[SEARCH-DEBUG] NotaryList.performSearch executing with:', { coordinates, filters });
    setLoading(true);
    setError(null);
    setFilteredNotaries([]); // Clear previous results before new search

    try {
      const radiusKm = milesToKm(filters.maxDistance);

      console.log('[SEARCH-DEBUG] Executing Supabase query with parameters:', {
        directory_slug: slug,
        radiusKm,
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        serviceType: filters.serviceType,
        minRating: filters.minimumRating ? 3.5 : 0
      });

      // --- Query Starts ---
      let query = supabase
        .from('notaries') // Target the 'notaries' table
        .select('*')      // Select all columns for now
        .eq('directory_slug', slug); // Filter by the directory slug

      // ** REMOVED FILTER: .eq('is_active', true) ** -> This column does not exist

      // Apply optional service type filter
      if (filters.serviceType) {
        query = query.contains('services', [filters.serviceType]);
      }

      // Apply optional minimum rating filter
      if (filters.minimumRating) {
        // Schema confirms 'rating' column exists
        query = query.gte('rating', 3.5);
      }
      // --- Query Ends ---

      const { data, error: queryError } = await query;

      if (queryError) {
        // Throw query errors to be caught by the main catch block
        throw queryError;
      }

      if (!data || data.length === 0) {
        console.log('[SEARCH-DEBUG] No matching notaries found in DB for slug/filters.');
        setFilteredNotaries([]);
      } else {
         console.log(`[SEARCH-DEBUG] Initial query returned ${data.length} notaries before distance filtering`);
         // Calculate distance and filter client-side
         const notariesWithDistance = data.map(notary => {
           const lat = typeof notary.latitude === 'number' ? notary.latitude : 0;
           const lon = typeof notary.longitude === 'number' ? notary.longitude : 0;
           const distance = calculateDistance(
             coordinates.latitude,
             coordinates.longitude,
             lat,
             lon
           );
           return {
             ...notary,
             // Handle case where distance calculation might return Infinity
             distance: Number.isFinite(distance) ? kmToMiles(distance) : Infinity
           };
         });

         // Filter by distance and sort
         const filtered = notariesWithDistance
           .filter(notary => typeof notary.distance === 'number' && notary.distance <= filters.maxDistance)
           .sort((a, b) => (a.distance as number) - (b.distance as number));

         console.log(`[SEARCH-DEBUG] After distance filtering, ${filtered.length} notaries within ${filters.maxDistance} miles`);
         setFilteredNotaries(filtered);
      }

    } catch (err) {
      console.error('[SEARCH-DEBUG] Supabase query error:', err);
      // Set a user-friendly error message
      setError(err instanceof Error ? `Search failed: ${err.message}` : 'An unknown error occurred during search.');
      setFilteredNotaries([]); // Clear results on error
    } finally {
      setLoading(false);
      setSearchPerformed(true); // Mark search as completed (or attempted)
    }
    // Dependencies for useCallback: supabase client and the slug used in the query
  }, [supabase, slug]);

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
      if (setIsLoading) setIsLoading(true);
      
      // Execute search with the new parameters
      performSearch(searchParams.coordinates, searchParams.filters);
    } else if (searchParams === null) {
      // Handle initial state or cleared search
      setFilteredNotaries([]);
      setSearchPerformed(false);
      setError(null);
      setLoading(false);
      if (setIsLoading) setIsLoading(false);
    } else if (searchParams && !searchParams.coordinates) {
      // Handle case where search was requested without coordinates
      console.warn("[SEARCH-DEBUG] Search requested but no coordinates available.");
      setFilteredNotaries([]);
      setSearchPerformed(true);
      setError("Please provide a valid location for the search.");
      setLoading(false);
      if (setIsLoading) setIsLoading(false);
    } else if (!supabase) {
      // Handle case where Supabase client failed to initialize
      setError("Database connection unavailable. Please refresh.");
      setFilteredNotaries([]);
      setSearchPerformed(true);
      setLoading(false);
      if (setIsLoading) setIsLoading(false);
    }
  }, [searchParams, supabase, performSearch, setIsLoading]);

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
