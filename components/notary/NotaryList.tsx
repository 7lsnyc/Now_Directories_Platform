'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import NotarySearchForm, { SearchFilters } from './NotarySearchForm';
import { kmToMiles } from '@/utils/geocoding';
import { Directory, DirectoryThemeColors } from '@/types/directory';

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
}

/**
 * NotaryList component with geolocation-enhanced search
 * Displays a search form and notary results with filters
 */
export default function NotaryList({ 
  slug = 'notaryfindernow',
  directoryData,
  themeColors 
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
  
  // Use a ref for the Supabase client to avoid recreating it on each render
  const supabaseRef = useRef<SupabaseClient<Database> | null>(null);
  
  // Initialize the Supabase client on the client side only to prevent hydration errors
  useEffect(() => {
    if (!supabaseRef.current && typeof window !== 'undefined') {
      supabaseRef.current = createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      console.log('[NotaryList] Supabase client initialized');
    }
  }, []);

  useEffect(() => {
    const checkNotaryData = async () => {
      if (supabaseRef.current) {
        try {
          console.log(`[NotaryList] Checking if notaries exist for slug: ${slug}`);
          
          // First check with directory slug filter
          const { data: directoryData, error: directoryError, count: directoryCount } = await supabaseRef.current
            .from('notaries')
            .select('*', { count: 'exact' })
            .eq('directory_slug', slug);
          
          if (directoryError) {
            console.error(`[NotaryList] Error fetching initial notary data:`, directoryError);
          } else {
            console.log(`[NotaryList] Found ${directoryCount} notaries for ${slug}`, 
              directoryData?.length ? `First notary: ${directoryData[0].name}` : 'No data');
            
            if (!directoryData || directoryData.length === 0) {
              console.warn(`[NotaryList] No notary data found for ${slug}. Search will return empty results.`);
              
              // Check without directory filter
              const { data: allData, count: totalCount } = await supabaseRef.current
                .from('notaries')
                .select('*', { count: 'exact' });
                
              console.log(`[NotaryList] Total notaries in table (any directory): ${totalCount}`);
              
              if (allData && allData.length > 0) {
                // Analyze directory slugs to help diagnose the issue
                const slugs = allData.map(n => n.directory_slug);
                const uniqueSlugs = Array.from(new Set(slugs));
                console.log(`[NotaryList] Found these directory_slug values in the database:`, uniqueSlugs);
                
                // Check if we have a city match without the directory slug
                const nyMatches = allData.filter(n => 
                  n.city?.toLowerCase().includes('new york') || 
                  n.state?.toLowerCase() === 'ny' ||
                  n.state?.toLowerCase() === 'new york'
                );
                
                if (nyMatches.length > 0) {
                  console.log(`[NotaryList] Found ${nyMatches.length} New York notaries, but with wrong directory_slug:`, 
                    nyMatches.map(n => ({ 
                      name: n.name, 
                      city: n.city, 
                      state: n.state, 
                      directory_slug: n.directory_slug 
                    }))
                  );
                }
              }
            }
          }
        } catch (err) {
          console.error('[NotaryList] Error in initial data check:', err);
        }
      }
    };
    
    checkNotaryData();
  }, [slug]);

  useEffect(() => {
    const loadAvailableServices = async () => {
      if (!supabaseRef.current) return;
      
      try {
        const { data, error } = await supabaseRef.current
          .from('notaries')
          .select('services')
          .eq('directory_slug', slug);
        
        if (error) {
          console.error('[NotaryList] Error loading services:', error);
          throw error;
        }
        
        if (data && data.length > 0) {
          const allServices = data
            .flatMap(notary => notary.services || [])
            .filter(Boolean) as string[];
          
          const uniqueServicesList = allServices.filter((service, index, self) => 
            self.indexOf(service) === index
          );
          setUniqueServices(uniqueServicesList);
          console.log(`[NotaryList] Loaded ${uniqueServicesList.length} unique services`, uniqueServicesList);
        } else {
          console.warn('[NotaryList] No services found for this directory');
        }
      } catch (err) {
        console.error('Error loading service types:', err);
      }
    };
    
    loadAvailableServices();
  }, [supabaseRef, slug]);

  /**
   * Search for notaries based on location and apply filters
   */
  const searchNotaries = async (
    coordinates: Coordinates, 
    filters: SearchFilters
  ) => {
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);
    
    console.log(`[NotaryList] Searching near: ${coordinates.latitude},${coordinates.longitude}`, 
      `Filters:`, filters);
    
    try {
      if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        throw new Error('Invalid coordinates. Please try again with a valid location.');
      }
      
      // Start building the query
      let query = supabaseRef.current!
        .from('notaries')
        .select('*')
        .eq('directory_slug', slug);
      
      if (filters.serviceType) {
        console.log(`[NotaryList] Adding service filter: ${filters.serviceType}`);
        query = query.contains('services', [filters.serviceType]);
      }
      
      if (filters.minimumRating) {
        console.log(`[NotaryList] Adding minimum rating filter: 3.5+`);
        query = query.gte('rating', 3.5);
      }
      
      console.log(`[NotaryList] Executing search query for ${slug}`);
      const { data, error } = await query;
      
      if (error) {
        console.error(`[NotaryList] Search query error:`, error);
        throw error;
      }
      
      console.log(`[NotaryList] Search query returned ${data?.length || 0} results before distance filtering`);
      
      if (!data || data.length === 0) {
        setNotaries([]);
        setFilteredNotaries([]);
        setSearchPerformed(true);
        console.log(`[NotaryList] No results found from database query`);
        return;
      }
      
      const notariesWithDistance = data.map(notary => {
        const lat1 = coordinates.latitude;
        const lon1 = coordinates.longitude;
        const lat2 = notary.latitude;
        const lon2 = notary.longitude;
        
        if (!lat2 || !lon2) {
          console.warn(`[NotaryList] Notary ${notary.id} missing coordinates`);
          return { ...notary, distance: 99999 };
        }
        
        const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
        const distanceMiles = kmToMiles(distanceKm);
        
        return {
          ...notary,
          distance: distanceMiles
        };
      });
      
      const sortedNotaries = notariesWithDistance.sort((a, b) => 
        (a.distance as number) - (b.distance as number)
      );
      
      console.log(`[NotaryList] Sorted ${sortedNotaries.length} notaries by distance`);
      if (sortedNotaries.length > 0) {
        console.log(`[NotaryList] Closest notary: ${sortedNotaries[0].name} (${(sortedNotaries[0].distance as number).toFixed(1)} miles)`);
      }
      
      const maxDistance = filters.maxDistance || 20;
      console.log(`[NotaryList] Filtering to max distance: ${maxDistance} miles`);
      
      const filteredByDistance = sortedNotaries.filter(
        notary => (notary.distance as number) <= maxDistance
      );
      
      console.log(`[NotaryList] After distance filtering: ${filteredByDistance.length} results`);
      
      setNotaries(sortedNotaries);
      setFilteredNotaries(filteredByDistance);
      setSearchPerformed(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error searching for notaries');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
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

  // Log directory info for debugging
  useEffect(() => {
    if (directoryData) {
      console.log(`[NotaryList] Rendering for directory: ${directoryData.name} (${slug})`);
    } else {
      console.warn(`[NotaryList] No directory data available for slug: ${slug}`);
    }
  }, [directoryData, slug]);
  
  // Get primary color from directory data or fallback to theme colors
  const primaryColor = directoryData?.brand_color_primary || themeColors.primary;

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <NotarySearchForm 
        onSearch={searchNotaries} 
        availableServices={uniqueServices}
        isLoading={loading}
        primaryColor={primaryColor}
      />
      
      {/* Results Section */}
      <div className="mt-8">
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
