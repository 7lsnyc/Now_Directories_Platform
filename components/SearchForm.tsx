'use client';

import React, { useState } from 'react';
import { useDirectorySearch } from '@/lib/search/useDirectorySearch';
import ErrorDisplay from '@/components/ErrorDisplay';

interface SearchFormProps {
  directorySlug: string;
  serviceTypes: string[];
}

/**
 * SearchForm component with integrated error handling
 * Demonstrates using the error handling utilities in a real component
 */
const SearchForm: React.FC<SearchFormProps> = ({ 
  directorySlug,
  serviceTypes = [] 
}) => {
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [keywords, setKeywords] = useState('');
  
  const { 
    search, 
    searchWithGeolocation, 
    loading, 
    error, 
    results, 
    clearError 
  } = useDirectorySearch(directorySlug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await search({ location, serviceType, keywords });
  };

  const handleUseCurrentLocation = async () => {
    await searchWithGeolocation({ serviceType, keywords });
  };

  const handleRetry = () => {
    clearError();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <div className="mt-1 relative">
              <input
                type="text"
                id="location"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-theme-primary focus:ring-theme-primary"
                placeholder="City, state or ZIP code"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-theme-primary"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <select
              id="serviceType"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-theme-primary focus:border-theme-primary rounded-md"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
            >
              <option value="">All Services</option>
              {serviceTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div>
          <label htmlFor="keywords" className="block text-sm font-medium text-gray-700">
            Keywords (Optional)
          </label>
          <input
            type="text"
            id="keywords"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-theme-primary focus:ring-theme-primary"
            placeholder="Search by keywords..."
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>
        
        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme-primary hover:bg-theme-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      
      {/* Error Display */}
      {error && (
        <div className="mt-4">
          <ErrorDisplay error={error} onRetry={handleRetry} />
        </div>
      )}
      
      {/* Results Display */}
      {results.length > 0 && !error && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Results ({results.length})</h3>
          <div className="space-y-4">
            {results.map((result) => (
              <div key={result.id} className="p-4 bg-white shadow rounded-lg">
                <h4 className="text-md font-medium text-gray-900">{result.name}</h4>
                {result.description && (
                  <p className="mt-1 text-sm text-gray-500">{result.description}</p>
                )}
                {result.address && (
                  <p className="mt-2 text-xs text-gray-500">{result.address}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchForm;
