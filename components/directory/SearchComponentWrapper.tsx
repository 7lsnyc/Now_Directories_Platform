'use client';

import { useState } from 'react';
import { Directory, DirectoryThemeColors } from '@/types/directory';
import { getSearchFormComponent, getListWrapperComponent } from '@/lib/registry';
import { Coordinates, SearchFilters } from '@/components/notary/NotarySearchForm';

interface SearchComponentWrapperProps {
  slug: string;
  directoryData: Directory | null;
  themeColors: DirectoryThemeColors;
}

/**
 * Client-side wrapper for search components
 * Handles the integration between search form and results list components
 * This component bridges the gap between server components and client components
 */
export default function SearchComponentWrapper({
  slug,
  directoryData,
  themeColors
}: SearchComponentWrapperProps) {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the appropriate components from the registry based on directory features
  const SearchFormComponent = directoryData ? getSearchFormComponent(directoryData) : null;
  const ListWrapperComponent = directoryData ? getListWrapperComponent(directoryData) : null;
  
  // The available services should ideally come from the database
  // For now, we'll hardcode common notary services
  const availableServices = ['Mobile Notary', 'Remote Online Notary', 'Office Notary'];
  
  // Handle search form submission
  const handleSearch = async (coordinates: Coordinates, filters: SearchFilters) => {
    if (!directoryData) return;
    
    setIsLoading(true);
    
    try {
      // Call API route to search for listings
      const searchParams = new URLSearchParams({
        lat: coordinates.latitude.toString(),
        lng: coordinates.longitude.toString(),
        radius: filters.maxDistance.toString(),
        service: filters.serviceType || '',
        minRating: filters.minimumRating ? '3.5' : '0'
      });
      
      const response = await fetch(`/api/directories/${slug}/search?${searchParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }
      
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      console.error('Search error:', error);
      // Set empty results on error
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // If no search component is available, show a message
  if (!SearchFormComponent) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">
          No search functionality is available for this directory yet.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      {/* Search Form */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <SearchFormComponent
          slug={slug}
          directoryData={directoryData}
          themeColors={themeColors}
          availableServices={availableServices}
          isLoading={isLoading}
          primaryColor={themeColors.primary}
          onSearch={handleSearch}
        />
      </div>
      
      {/* Results List */}
      {ListWrapperComponent && (
        <div className="mt-8">
          <ListWrapperComponent
            slug={slug}
            directoryData={directoryData}
            themeColors={themeColors}
            results={results}
            loading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
