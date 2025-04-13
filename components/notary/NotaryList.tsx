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

  // React to search parameters changes
  useEffect(() => {
    if (!searchParams || !supabase) {
      console.log('[SEARCH-DEBUG] NotaryList useEffect skipped - no searchParams or supabase');
      return;
    }
    
    // Set loading state in parent component if provided
    if (setIsLoading) setIsLoading(true);
    
    const hasCoordinatesChanged = lastCoordinatesRef.current ? 
      JSON.stringify(lastCoordinatesRef.current) !== JSON.stringify(searchParams.coordinates) : 
      true;
    
    console.log('[SEARCH-DEBUG] NotaryList useEffect triggered with new searchParams:', {
      coordinates: searchParams.coordinates,
      filters: searchParams.filters,
      prevCoordinates: lastCoordinatesRef.current,
      hasCoordinatesChanged
    });
    
    // Execute search with the new parameters
    searchNotaries(searchParams.coordinates, searchParams.filters);
    
  }, [searchParams, supabase, setIsLoading]);

  /**
   * Search for notaries based on location and apply filters
   */
  const searchNotaries = async (
    coordinates: Coordinates, 
    filters: SearchFilters
  ) => {
    // Ensure Supabase client is available
    if (!supabase) {
      setError('Unable to connect to the database. Please try again later.');
      return;
    }
    
    console.log('[SEARCH-DEBUG] NotaryList.searchNotaries called with:', { 
      coordinates, 
      filters,
      slug 
    });
    
    // Save the coordinates for comparison in future searches
    lastCoordinatesRef.current = coordinates;
    
    // Update current filters for display
    setCurrentFilters(filters);
    
    // Start loading state
    setLoading(true);
    if (setIsLoading) setIsLoading(true);
    setError(null);
    
    try {
      // Convert miles to kilometers for the database query
      // Supabase PostGIS uses meters, so multiply by 1000
      const radiusMeters = milesToKm(filters.maxDistance) * 1000;
      
      console.log('[SEARCH-DEBUG] Executing Supabase query with params:', {
        lat: coordinates.latitude,
        lng: coordinates.longitude,
        radiusMeters,
        serviceType: filters.serviceType,
        minRating: filters.minimumRating ? 3.5 : 0
      });
      
      // Query notaries from Supabase
      let query = supabase
        .from('notaries')
        .select('*')
        .eq('directory_slug', slug)
        .filter('is_active', 'eq', true);
      
      // Add minimum rating filter if requested
      if (filters.minimumRating) {
        query = query.gte('rating', 3.5);
      }
      
      // Add service type filter if specified
      if (filters.serviceType) {
        // Using Postgres array contains operator for array search
        query = query.contains('services', [filters.serviceType]);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('[SEARCH-DEBUG] No notaries found in the database query');
        setNotaries([]);
        setFilteredNotaries([]);
        setSearchPerformed(true);
        setLoading(false);
        if (setIsLoading) setIsLoading(false);
        return;
      }
      
      console.log(`[SEARCH-DEBUG] Initial query returned ${data.length} notaries before distance filtering`);
      
      // Calculate distance for each notary and add as a property
      const notariesWithDistance = data.map(notary => {
        // Nullable check for lat/lng
        if (notary.latitude && notary.longitude) {
          const distanceKm = calculateDistance(
            coordinates.latitude,
            coordinates.longitude,
            notary.latitude,
            notary.longitude
          );
          const distanceMiles = kmToMiles(distanceKm);
          return { ...notary, distance: distanceMiles };
        }
        // If notary doesn't have coordinates, set a very large distance
        return { ...notary, distance: 9999 };
      });
      
      // Filter by distance and sort by proximity
      const filteredByDistance = notariesWithDistance
        .filter(notary => notary.distance <= filters.maxDistance)
        .sort((a, b) => (a.distance as number) - (b.distance as number));
      
      console.log(`[SEARCH-DEBUG] After distance filtering, ${filteredByDistance.length} notaries within ${filters.maxDistance} miles`);
      
      // Update state with the results
      setNotaries(notariesWithDistance);
      setFilteredNotaries(filteredByDistance);
      setSearchPerformed(true);
    } catch (err) {
      console.error('[SEARCH-DEBUG] Search error:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setFilteredNotaries([]);
    } finally {
      setLoading(false);
      if (setIsLoading) setIsLoading(false);
    }
  };

  /**
   * Calculate the distance between two coordinate points
   * Using the Haversine formula to calculate distance between two points on a sphere
   */
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    return distance;
  };

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
