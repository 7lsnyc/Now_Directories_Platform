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
  // Store search parameters to pass down to the list component
  const [searchParams, setSearchParams] = useState<{
    coordinates: Coordinates;
    filters: SearchFilters;
  } | null>(null);
  
  // State for loading status (managed here to communicate with form)
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the appropriate components from the registry based on directory features
  const SearchFormComponent = directoryData ? getSearchFormComponent(directoryData) : null;
  
  // The available services should ideally come from the database
  // For now, we'll hardcode common notary services
  const availableServices = ['Mobile Notary', 'Remote Online Notary', 'Office Notary'];
  
  // Handle search form submission by updating search parameters
  const handleSearch = (coordinates: Coordinates, filters: SearchFilters) => {
    console.log('[SEARCH-DEBUG] SearchComponentWrapper received search:', { coordinates, filters });
    
    // Update search parameters - this will trigger the list component to fetch data
    setSearchParams({ coordinates, filters });
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
      <div>
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
    </div>
  );
}
