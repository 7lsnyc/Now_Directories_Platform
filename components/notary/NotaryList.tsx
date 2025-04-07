'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase';
import env from '@/lib/env';
import NotarySearchForm, { SearchFilters } from './NotarySearchForm';
import { kmToMiles } from '@/utils/geocoding';

// Types
type Notary = Database['public']['Tables']['notaries']['Row'];

interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * NotaryList component with geolocation-enhanced search
 * Displays a search form and notary results with filters
 */
export default function NotaryList() {
  // State
  const [notaries, setNotaries] = useState<Notary[]>([]);
  const [filteredNotaries, setFilteredNotaries] = useState<Notary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uniqueServices, setUniqueServices] = useState<string[]>([]);
  
  // Create the Supabase client
  const supabase = createClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  /**
   * Load all available service types for the filter dropdown
   */
  const loadAvailableServices = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('notaries')
        .select('services')
        .eq('directory_slug', 'notaryfindernow');
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Extract all unique services from the array of services arrays
        const allServices = data
          .flatMap(notary => notary.services || [])
          .filter(Boolean);
        
        // Remove duplicates
        const uniqueServicesList = [...new Set(allServices)];
        setUniqueServices(uniqueServicesList);
      }
    } catch (err) {
      console.error('Error loading service types:', err);
    }
  }, [supabase]);

  useEffect(() => {
    // Load available service types on component mount
    loadAvailableServices();
  }, [loadAvailableServices]);

  /**
   * Search for notaries based on location and apply filters
   */
  const searchNotaries = async (
    coordinates: Coordinates, 
    filters: SearchFilters
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate coords
      if (!coordinates || !coordinates.latitude || !coordinates.longitude) {
        throw new Error('Invalid coordinates. Please try again with a valid location.');
      }
      
      // Start building the query
      let query = supabase
        .from('notaries')
        .select('*')
        .eq('directory_slug', 'notaryfindernow');
      
      // Apply service type filter if selected
      if (filters.serviceType) {
        query = query.contains('services', [filters.serviceType]);
      }
      
      // Apply minimum rating filter if selected
      if (filters.minimumRating) {
        query = query.gte('rating', 3.5);
      }
      
      const { data, error } = await query;
      
      if (error) {
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
        
        // Calculate distance in KM, convert to miles for display
        const distanceKm = calculateDistance(lat1, lon1, lat2, lon2);
        const distanceMiles = kmToMiles(distanceKm);
        
        return {
          ...notary,
          distance: distanceMiles
        };
      });
      
      // Sort by distance (closest first)
      notariesWithDistance.sort((a, b) => a.distance - b.distance);
      
      // Only show notaries within a 50-mile radius
      const nearbyNotaries = notariesWithDistance.filter(
        notary => notary.distance <= 50
      );
      
      setNotaries(notariesWithDistance);
      setFilteredNotaries(nearbyNotaries);
      setSearchPerformed(true);
    } catch (err) {
      console.error('Error searching notaries:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'Failed to search notaries. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Calculate the distance between two coordinate points
   */
  const calculateDistance = (
    lat1: number, 
    lon1: number, 
    lat2: number, 
    lon2: number
  ): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    
    return distance;
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <NotarySearchForm 
        onSearch={searchNotaries} 
        availableServices={uniqueServices}
        isLoading={loading}
      />
      
      {/* Results Section */}
      <div className="mt-8">
        {loading && (
          <div className="p-4 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-4 border-theme-primary border-t-transparent rounded-full"></div>
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
                    <div className="text-sm text-theme-primary font-medium">
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
                        className="bg-theme-primary text-white text-xs px-2 py-1 rounded"
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
