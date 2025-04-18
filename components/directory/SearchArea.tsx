'use client';

import { useState, useEffect } from 'react';
import { Directory, DirectoryThemeColors } from '@/types/directory';
import { getSearchFormComponent, getListWrapperComponent } from '@/lib/registry/componentRegistry';
import { Coordinates, SearchFilters } from '@/lib/providerSearchClient';

interface SearchAreaProps {
  slug: string;
  directoryData: Directory | null;
  themeColors: DirectoryThemeColors;
}

/**
 * SearchArea component
 * A client-side wrapper that manages the search state and renders both 
 * the search form and results list components
 * This component ensures proper state flow between the search form and results
 */
export default function SearchArea({
  slug,
  directoryData,
  themeColors
}: SearchAreaProps) {
  // Store search parameters to pass down to the list component
  const [searchParams, setSearchParams] = useState<{
    coordinates: Coordinates;
    filters: SearchFilters;
  } | null>(null);
  
  // State for loading status (managed here to communicate with form)
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Get the appropriate components from the registry based on directory features
  const SearchFormComponent = directoryData ? getSearchFormComponent(directoryData) : null;
  const ListWrapperComponent = directoryData ? getListWrapperComponent(directoryData) : null;
  
  // Default available services - in a real implementation, these would come from
  // the database based on the provider type, or from the provider configuration
  const availableServices = [
    'Mobile Notary', 
    'Remote Online Notary', 
    'Office Notary'
  ];
  
  /**
   * Handler for when the loading state changes in the child component
   */
  const handleLoadingChange = (loading: boolean) => {
    setIsLoading(loading);
  };
  
  /**
   * Handler for when a search is performed in the search form
   */
  const handleSearch = (coordinates: Coordinates, filters: SearchFilters) => {
    setSearchParams({ coordinates, filters });
  };
  
  // If no search components are available, show a message
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
    <div className="space-y-12">
      {/* Search Form Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">
          Find {directoryData?.service_label || directoryData?.name || 'Services'} Near You
        </h2>
        
        <SearchFormComponent
          slug={slug}
          directorySlug={slug}
          directoryData={directoryData}
          themeColors={themeColors}
          availableServices={availableServices}
          isLoading={isLoading}
          primaryColor={themeColors.primary}
          onSearch={handleSearch}
        />
      </div>
      
      {/* Results List Section */}
      {ListWrapperComponent && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-6">
            {directoryData?.name || 'Directory'} Results
          </h2>
          
          <ListWrapperComponent
            slug={slug}
            directoryData={directoryData}
            themeColors={themeColors}
            searchParams={searchParams}
            onLoadingChange={handleLoadingChange}
          />
        </div>
      )}
    </div>
  );
}
