'use client';

import { useState, useCallback } from 'react';
import supabase from '@/lib/supabase';
import { handleSearchError, ErrorResponse } from '@/lib/errors/errorHandling';

interface SearchFilters {
  location?: string;
  serviceType?: string;
  radius?: number;
  keywords?: string;
}

interface SearchResult {
  id: string;
  name: string;
  description?: string;
  address?: string;
  distance?: number;
  serviceTypes?: string[];
  [key: string]: any;
}

/**
 * Custom hook for directory searching with integrated error handling
 * Provides search functionality with standardized error responses
 */
export function useDirectorySearch(directorySlug: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorResponse | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);

  /**
   * Search directory listings with the given filters
   */
  const search = useCallback(async (filters: SearchFilters) => {
    setLoading(true);
    setError(null);

    try {
      // Start with the base query
      let query = supabase
        .from('listings')
        .select('*')
        .eq('directory_slug', directorySlug);

      // Apply location filter if it exists
      // Simplified approach - in a real app, you'd use geolocation and distance calculations
      if (filters.location) {
        query = query.ilike('address', `%${filters.location}%`);
      }

      // Apply service type filter if it exists
      if (filters.serviceType) {
        query = query.contains('service_types', [filters.serviceType]);
      }

      // Apply keyword search if provided
      if (filters.keywords) {
        query = query.or(`name.ilike.%${filters.keywords}%,description.ilike.%${filters.keywords}%`);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data || data.length === 0) {
        // Create a custom error for no results
        throw new Error('no results found for the specified criteria');
      }

      setResults(data as SearchResult[]);
      return { success: true, results: data };
    } catch (err) {
      const errorResponse = handleSearchError(err);
      setError(errorResponse);
      return { success: false, error: errorResponse };
    } finally {
      setLoading(false);
    }
  }, [directorySlug]);

  /**
   * Attempt to search using the user's current geolocation
   */
  const searchWithGeolocation = useCallback(async (filters: Omit<SearchFilters, 'location'>) => {
    setLoading(true);
    setError(null);

    try {
      // This check needs to run in the browser
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        throw new Error('geolocation is not supported by this browser');
      }

      // Wrap the geolocation API in a promise
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;

      // Now perform the search with the coordinates
      // In a real implementation, you'd use PostGIS or a similar spatial DB feature
      // This is simplified for the example
      const searchResults = await search({
        ...filters,
        location: `${latitude},${longitude}`
      });

      return searchResults;
    } catch (err) {
      const errorResponse = handleSearchError(err);
      setError(errorResponse);
      return { success: false, error: errorResponse };
    } finally {
      setLoading(false);
    }
  }, [search]);

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return {
    search,
    searchWithGeolocation,
    loading,
    error,
    results,
    clearError,
    clearResults
  };
}
