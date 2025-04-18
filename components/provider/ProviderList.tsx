'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Directory, DirectoryThemeColors } from '@/types/directory';
import { useSupabase } from '@/lib/supabase/clientProvider';
import { getProviderConfigFromSlug } from '@/types/provider';
import { 
  Coordinates, 
  SearchFilters, 
  createSearchParams, 
  calculateDistance,
  ProviderSearchResult
} from '@/lib/providerSearchClient';

interface ProviderListProps {
  slug: string;
  directoryData: Directory;
  themeColors: DirectoryThemeColors;
  onLoadingChange?: (isLoading: boolean) => void;
  searchParams?: {
    coordinates: Coordinates;
    filters: SearchFilters;
  };
}

export default function ProviderList({ 
  slug, 
  directoryData, 
  themeColors, 
  onLoadingChange,
  searchParams 
}: ProviderListProps) {
  // State for providers data
  const [providers, setProviders] = useState<any[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<any[]>([]);
  
  // State for UI control
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  
  // Error handling state - more granular error states
  const [error, setError] = useState<string | null>(null);
  const [noResultsFound, setNoResultsFound] = useState(false);
  
  // Tracking state for search parameters
  const [currentFilters, setCurrentFilters] = useState<SearchFilters | null>(null);
  const lastSearchParamsRef = useRef<{
    coordinates?: Coordinates;
    filters?: SearchFilters;
  }>({});

  // Get provider configuration for this directory
  const providerConfig = getProviderConfigFromSlug(slug);
  const fields = providerConfig.fields;
  
  // Get labels for provider type from the provider configuration
  const labels = providerConfig.labels;
  
  // Service types for filtering
  const [uniqueServices, setUniqueServices] = useState<string[]>([]);
  
  // Memoize the filter function to prevent creating a new function on each render
  const filterProviders = useCallback((providers: any[], coordinates: Coordinates, filters: SearchFilters) => {
    // Filter providers based on search criteria
    let filtered = [...providers];
    
    // LOGGING POINT 7: Before distance filtering
    console.log('🔍 BEFORE DISTANCE FILTERING:', {
      providersCount: filtered.length
    });
    
    // 1. Filter by distance
    filtered = filtered.filter(provider => {
      if (!provider.latitude || !provider.longitude) {
        console.log('🔍 PROVIDER MISSING COORDINATES:', { 
          providerId: provider.id,
          name: provider.name,
          latitude: provider.latitude,
          longitude: provider.longitude
        });
        return false;
      }
      
      const distance = calculateDistance(
        coordinates.latitude,
        coordinates.longitude,
        provider.latitude,
        provider.longitude
      );
      
      // Add distance property for display
      (provider as any).distance = distance;
      
      const withinRange = distance <= filters.maxDistance;
      if (!withinRange) {
        console.log(`🔍 PROVIDER FILTERED OUT BY DISTANCE: ${provider.name} is ${distance.toFixed(1)} miles away (max: ${filters.maxDistance})`);
      }
      
      return withinRange;
    });
    
    // LOGGING POINT 8: After distance filtering
    console.log('🔍 AFTER DISTANCE FILTERING:', {
      providersRemaining: filtered.length,
      reduction: `${providers.length} → ${filtered.length}`
    });
    
    // 2. Filter by service type if specified and provider has specializations
    if (filters.serviceType && providerConfig.features.hasSpecializations) {
      // LOGGING POINT 9: Before service type filtering
      console.log('🔍 BEFORE SERVICE TYPE FILTERING:', {
        serviceType: filters.serviceType,
        providersCount: filtered.length
      });
      
      const beforeCount = filtered.length;
      filtered = filtered.filter(
        provider => {
          const hasService = provider[fields.specializations as keyof typeof provider] && 
                         Array.isArray(provider[fields.specializations as keyof typeof provider]) && 
                         (provider[fields.specializations as keyof typeof provider] as string[]).includes(filters.serviceType);
          
          if (!hasService) {
            console.log(`🔍 PROVIDER FILTERED OUT BY SERVICE TYPE: ${provider.name} does not offer ${filters.serviceType}`);
            // Log the actual services this provider offers
            const services = provider[fields.specializations as keyof typeof provider];
            console.log(`Available services: ${Array.isArray(services) ? services.join(', ') : 'None'}`);
          }
          
          return hasService;
        }
      );
      
      // LOGGING POINT 10: After service type filtering
      console.log('🔍 AFTER SERVICE TYPE FILTERING:', {
        providersRemaining: filtered.length,
        reduction: `${beforeCount} → ${filtered.length}`
      });
    }
    
    // 3. Filter by minimum rating if specified and provider has ratings
    if (filters.minimumRating && providerConfig.features.hasRatings) {
      // LOGGING POINT 11: Before rating filtering
      console.log('🔍 BEFORE RATING FILTERING:', {
        minimumRating: providerConfig.defaults.minimumRating,
        providersCount: filtered.length
      });
      
      const beforeCount = filtered.length;
      filtered = filtered.filter(
        provider => {
          const meetsMinimumRating = provider.rating >= providerConfig.defaults.minimumRating;
          if (!meetsMinimumRating) {
            console.log(`🔍 PROVIDER FILTERED OUT BY RATING: ${provider.name} has rating ${provider.rating} (minimum: ${providerConfig.defaults.minimumRating})`);
          }
          return meetsMinimumRating;
        }
      );
      
      // LOGGING POINT 12: After rating filtering
      console.log('🔍 AFTER RATING FILTERING:', {
        providersRemaining: filtered.length,
        reduction: `${beforeCount} → ${filtered.length}`
      });
    }
    
    // 4. Sort by distance (nearest first)
    filtered.sort((a, b) => (a as any).distance - (b as any).distance);
    
    return filtered;
  }, [providerConfig.features, providerConfig.defaults.minimumRating, fields.specializations]);

  // Fetch providers using the API endpoint
  const fetchProviders = useCallback(async (coordinates: Coordinates, filters: SearchFilters, page = 0) => {
    try {
      // Reset error states at the start of a new search
      setError(null);
      setNoResultsFound(false);
      
      // LOGGING POINT 3: Log start of API request
      console.log('🔍 FETCHING PROVIDERS VIA API:', {
        slug,
        coordinates,
        filters,
        page
      });
      
      // Create search params for the API with a larger page size to show more results
      const searchParamsObj = createSearchParams(coordinates, filters, slug, page, 50);
      
      // LOGGING POINT: Log search parameters including page size
      console.log('🔍 SEARCH PARAMETERS WITH PAGE SIZE:', {
        ...searchParamsObj,
        pageSize: searchParamsObj.pageSize
      });
      
      // Call the API endpoint
      const response = await fetch('/api/providers/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(searchParamsObj),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${response.statusText}. ${errorText}`);
      }
      
      // Parse the result
      const result: ProviderSearchResult = await response.json();
      
      // LOGGING POINT 4: Log API response
      console.log('🔍 API RESPONSE:', {
        success: true,
        providersCount: result.providers.length,
        totalCount: result.totalCount,
        page: result.page,
        totalPages: result.totalPages
      });
      
      // Update pagination states
      setCurrentPage(result.page);
      setTotalPages(result.totalPages);
      setTotalResults(result.totalCount);
      
      if (!result.providers || result.providers.length === 0) {
        // Set no results state but don't treat as an error
        setNoResultsFound(true);
        setProviders([]);
        setFilteredProviders([]);
        console.warn(`No ${labels.plural.toLowerCase()} found for directory: ${slug}`);
        return;
      }
      
      // Reset no results state
      setNoResultsFound(false);
      
      console.log(`Found ${result.providers.length} ${labels.plural.toLowerCase()} for directory: ${slug}`);
      
      // Process the results
      const providers = result.providers;
      
      // Save all providers
      setProviders(providers);
      
      // LOGGING POINT 5: Log before client-side filtering starts
      console.log('🔍 STARTING CLIENT-SIDE FILTERING:', {
        providersBeforeFiltering: providers.length,
        coordinates,
        maxDistance: filters.maxDistance,
        serviceType: filters.serviceType || 'None',
        minimumRating: filters.minimumRating ? providerConfig.defaults.minimumRating : 'Not Applied'
      });
      
      // Apply any additional client-side filtering (if needed)
      // Note: Most filtering should now be handled on the server side via the API
      const filtered = filterProviders(providers, coordinates, filters);
      
      // LOGGING POINT 6: Log after all filtering is complete
      console.log('🔍 FILTERING COMPLETE:', {
        providersAfterFiltering: filtered.length,
        reduction: `${providers.length} → ${filtered.length}`,
        percentReduction: `${((providers.length - filtered.length) / providers.length * 100).toFixed(1)}%`
      });
      
      setFilteredProviders(filtered);
      setSearchPerformed(true);
      
    } catch (err) {
      console.error('Error fetching providers:', err instanceof Error ? err.message : 'Unknown error');
      
      // Set error state with a user-friendly message
      setError('There was a problem retrieving search results. Please try again.');
      
      // Clear provider states
      setProviders([]);
      setFilteredProviders([]);
      
      // Reset pagination states on error
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setLoading(false);
      if (onLoadingChange) onLoadingChange(false);
    }
  }, [slug, providerConfig.defaults.minimumRating, labels.plural, filterProviders, onLoadingChange]);

  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    
    // Get the last used search params
    const { coordinates, filters } = lastSearchParamsRef.current;
    
    if (!coordinates || !filters) return;
    
    // Update loading state
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    // Execute search with new page
    fetchProviders(coordinates, filters, newPage);
    
    // Scroll to top of results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages, fetchProviders, onLoadingChange]);

  // Process search parameters and perform search
  useEffect(() => {
    // Skip if no search params 
    if (!searchParams) return;
    
    const { coordinates, filters } = searchParams;
    
    // Skip if the search parameters haven't meaningfully changed
    // This is the key to preventing unnecessary re-renders
    const lastCoords = lastSearchParamsRef.current.coordinates;
    const lastFilters = lastSearchParamsRef.current.filters;
    
    const isSameSearch = 
      lastCoords && 
      lastFilters && 
      lastCoords.latitude === coordinates.latitude &&
      lastCoords.longitude === coordinates.longitude &&
      lastFilters.serviceType === filters.serviceType &&
      lastFilters.minimumRating === filters.minimumRating &&
      lastFilters.maxDistance === filters.maxDistance;
    
    // If we're already showing results for the same search parameters, don't restart the search
    if (isSameSearch) return;
    
    // Save the current search parameters for future comparison
    lastSearchParamsRef.current = { coordinates, filters };
    
    // LOGGING POINT 1: Log the configuration values
    console.log('🔍 SEARCH CONFIG:', {
      providerType: providerConfig.type,
      tableName: providerConfig.tableName,
      defaultRadius: providerConfig.defaults.radius,
      defaultMinimumRating: providerConfig.defaults.minimumRating,
      specializationsField: fields.specializations
    });
    
    // Create search params using the helper function
    const searchParamsObj = createSearchParams(coordinates, filters, slug, 0, 50);
    
    // LOGGING POINT 2: Log the exact search parameters being passed to the search function
    console.log('🔍 SEARCH PARAMETERS:', {
      latitude: searchParamsObj.latitude,
      longitude: searchParamsObj.longitude,
      radiusMiles: searchParamsObj.radiusMiles,
      serviceType: searchParamsObj.serviceType || 'None',
      minimumRating: searchParamsObj.minimumRating || 'Not Applied',
      directorySlug: searchParamsObj.directorySlug
    });
    
    // Save the current filters for display
    setCurrentFilters(filters);
    
    // Reset page to 0 for new searches
    setCurrentPage(0);
    
    // Set loading state
    setLoading(true);
    if (onLoadingChange) onLoadingChange(true);
    
    // Execute the search using API endpoint
    fetchProviders(coordinates, filters, 0);
    
  }, [
    searchParams, 
    onLoadingChange,
    fetchProviders
  ]);

  // Get a human-readable pagination summary
  const paginationSummary = totalResults > 0 
    ? `Showing page ${currentPage + 1} of ${totalPages} (${totalResults} total results)`
    : '';

  if (loading) {
    return (
      <div className="w-full">
        <div className="my-8">
          <div className="flex flex-col items-center justify-center p-8">
            <div 
              className="loader"
              style={{ borderTopColor: themeColors.primary || '#007BFF' }}
            ></div>
            <p className="mt-2">Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
          </p>
          <button 
            onClick={() => {
              // Retry the last search
              if (lastSearchParamsRef.current.coordinates && lastSearchParamsRef.current.filters) {
                setLoading(true);
                if (onLoadingChange) onLoadingChange(true);
                fetchProviders(
                  lastSearchParamsRef.current.coordinates, 
                  lastSearchParamsRef.current.filters,
                  currentPage
                );
              }
            }}
            className="mt-2 text-sm px-3 py-1 bg-red-100 hover:bg-red-200 rounded"
          >
            Retry Search
          </button>
        </div>
      )}
      
      {searchPerformed && !loading && !error && (
        <div className="my-4">
          {noResultsFound ? (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-md text-center">
              <p className="text-gray-700 mb-2">No {labels.plural.toLowerCase()} found for your search.</p>
              <p className="text-gray-500 text-sm">
                Try adjusting your search distance or removing some filters.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                {filteredProviders.length > 0 ? (
                  <>Found {totalResults} {labels.plural.toLowerCase()} matching your search criteria.</>
                ) : null}
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {filteredProviders.map((provider) => (
                  <div 
                    key={provider.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{provider.name}</h3>
                        
                        {/* Distance */}
                        {'distance' in provider && (
                          <div className="text-sm font-medium" style={{ color: themeColors.primary || '#007BFF' }}>
                            {(provider.distance as number).toFixed(1)} miles away
                          </div>
                        )}
                        
                        {/* Address */}
                        {provider.address && (
                          <div className="text-sm text-gray-600 mt-1">
                            {provider.address}
                            {provider.city && provider.state && (
                              <>, {provider.city}, {provider.state}</>
                            )}
                          </div>
                        )}
                        
                        {/* Phone */}
                        {provider.phone && (
                          <div className="text-sm mt-1">
                            <a 
                              href={`tel:${provider.phone}`} 
                              className="text-blue-600 hover:underline"
                            >
                              {provider.phone}
                            </a>
                          </div>
                        )}
                      </div>
                      
                      {/* Rating */}
                      {provider.rating && (
                        <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-sm font-medium">
                          {provider.rating} ⭐
                        </div>
                      )}
                    </div>
                    
                    {/* Specializations */}
                    {provider[fields.specializations as keyof typeof provider] && 
                     Array.isArray(provider[fields.specializations as keyof typeof provider]) && 
                     (provider[fields.specializations as keyof typeof provider] as string[]).length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-1">{labels.serviceLabel}:</p>
                        <div className="flex flex-wrap gap-1">
                          {(provider[fields.specializations as keyof typeof provider] as string[]).map((service, index) => (
                            <span 
                              key={index} 
                              className="text-white text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: themeColors.primary || '#007BFF' }}
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center">
                  <div className="text-sm text-gray-600 mb-3 sm:mb-0">
                    {paginationSummary}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className={`px-4 py-2 rounded-md ${
                        currentPage === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage >= totalPages - 1}
                      className={`px-4 py-2 rounded-md ${
                        currentPage >= totalPages - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
