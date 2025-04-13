'use client';

import { useState, useEffect } from 'react';
import { Directory, DirectoryThemeColors } from '@/types/directory';
import { getSearchFormComponent, getListWrapperComponent } from '@/lib/registry/componentRegistry';
import { Coordinates, SearchFilters } from '@/components/notary/NotarySearchForm';

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
  const [isLoading, setIsLoading] = useState(false);
  
  // Get the appropriate components from the registry based on directory features
  const SearchFormComponent = directoryData ? getSearchFormComponent(directoryData) : null;
  const ListWrapperComponent = directoryData ? getListWrapperComponent(directoryData) : null;
  
  // The available services should ideally come from the database
  // For now, we'll hardcode common notary services
  const availableServices = ['Mobile Notary', 'Remote Online Notary', 'Office Notary'];
  
  // Log whenever searchParams changes for debugging
  useEffect(() => {
    console.log('[SEARCH-DEBUG] SearchArea searchParams updated:', searchParams);
  }, [searchParams]);
  
  // Handle search form submission by updating search parameters
  const handleSearch = (coordinates: Coordinates, filters: SearchFilters) => {
    console.log('[SEARCH-DEBUG] SearchArea received search:', { coordinates, filters });
    
    // Update search parameters - this will trigger the list component to fetch data
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
            setIsLoading={setIsLoading}
          />
        </div>
      )}
    </div>
  );
}
