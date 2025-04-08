'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import NotarySearchForm, { SearchFilters } from './NotarySearchForm';
import { kmToMiles } from '@/utils/geocoding';
import { Directory, DirectoryThemeColors } from '@/types/directory';
import { useSupabase } from '@/lib/supabase/clientProvider';

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
  
  // Use the Supabase hook from the new provider
  const { supabase, isLoading: supabaseLoading } = useSupabase();
  
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
        }
      } catch (err) {
        console.error('Error loading service types:', err instanceof Error ? err.message : 'Unknown error');
      }
    };
    
    loadAvailableServices();
  }, [supabase, supabaseLoading, slug]);

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
    
    setLoading(true);
    setError(null);
    setCurrentFilters(filters);
    
    try {
      // Validate coords
      if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        throw new Error('Invalid coordinates. Please try again with a valid location.');
      }
      
      // Start building the query
      let query = supabase
        .from('notaries')
        .select('*')
        .eq('directory_slug', slug);
      
      if (filters.serviceType) {
        query = query.contains('services', [filters.serviceType]);
      }
      
      if (filters.minimumRating) {
        query = query.gte('rating', 3.5);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Search query error:', error.message);
        throw error;
      }
      
      if (!data || data.length === 0) {
        setNotaries([]);
        setFilteredNotaries([]);
        setSearchPerformed(true);
        return;
      }
      
      // Calculate distance for each notary and sort by proximity
      const notariesWithDistance = data.map(notary => {
        const lat1 = coordinates.latitude;
        const lon1 = coordinates.longitude;
        const lat2 = notary.latitude;
        const lon2 = notary.longitude;
        
        if (!lat2 || !lon2) {
          return { ...notary, distance: 99999 };
        }
        
        const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
        const distanceMiles = kmToMiles(distanceKm);
        
        return {
          ...notary,
          distance: distanceMiles
        };
      });
      
      // Sort by distance (closest first)
      const sortedNotaries = notariesWithDistance.sort((a, b) => 
        (a.distance as number) - (b.distance as number)
      );
      
      // Apply maximum distance filter (20 miles by default)
      const maxDistance = filters.maxDistance || 20;
      
      const filteredByDistance = sortedNotaries.filter(
        notary => (notary.distance as number) <= maxDistance
      );
      
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

  // Primary color for UI elements
  const primaryColor = themeColors?.primary || '#6366F1';

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
