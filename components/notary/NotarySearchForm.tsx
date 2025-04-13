'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { geocodeAddress } from '@/utils/geocoding';

// Define the structure for geographic coordinates
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Define the filters that can be applied to notary search
export interface SearchFilters {
  serviceType: string;
  minimumRating: boolean;
  maxDistance: number; // Maximum distance in miles
}

interface NotarySearchFormProps {
  onSearch: (coordinates: Coordinates, filters: SearchFilters) => void;
  availableServices: string[];
  isLoading: boolean;
  primaryColor: string; // Primary color for theming
}

/**
 * NotarySearchForm Component
 * Provides form inputs for location and filters to search for notaries
 * Includes geolocation for detecting user's current location
 */
export default function NotarySearchForm({ 
  onSearch, 
  availableServices, 
  isLoading,
  primaryColor 
}: NotarySearchFormProps) {
  // Client-side rendering guard
  const [isClient, setIsClient] = useState(false);
  
  // State for form inputs and status
  const [locationInput, setLocationInput] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [statusType, setStatusType] = useState<'success' | 'error' | ''>('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  
  // State for search filters
  const [filters, setFilters] = useState<SearchFilters>({
    serviceType: '',
    minimumRating: false,
    maxDistance: 20 // Default to 20 miles
  });

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle location input changes
  const handleLocationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    console.log('[SEARCH-DEBUG] Location input changed to:', newValue);
    setLocationInput(newValue);
    // Clear any previous coordinates when user starts typing
    setCoordinates(null);
    // Clear any previous status messages when user starts typing
    setLocationStatus('');
    setStatusType('');
  };

  // Handle service type selection
  const handleServiceTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, serviceType: e.target.value }));
  };

  // Handle maximum distance selection
  const handleMaxDistanceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value, 10) }));
  };

  // Handle minimum rating toggle
  const handleMinimumRatingToggle = (e: ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, minimumRating: e.target.checked }));
  };

  // Detect user's current location using browser geolocation API
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser');
      setStatusType('error');
      return;
    }

    setLocationStatus('Locating...');
    setStatusType('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCoordinates(coords);
        setLocationStatus('✓ Using your current location');
        setStatusType('success');
        
        // Trigger search with the detected location and current filters
        onSearch(coords, filters);
      },
      (error) => {
        let errorMessage = 'Unable to retrieve your location';
        
        // Provide more specific error messages based on the error code
        switch (error.code) {
          case 1:
            errorMessage = 'Location access was denied. Please enter your location manually.';
            break;
          case 2:
            errorMessage = 'Location unavailable. Please enter your address manually.';
            break;
          case 3:
            errorMessage = 'Location request timed out. Please try again or enter manually.';
            break;
        }
        
        setLocationStatus(errorMessage);
        setStatusType('error');
      }
    );
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // If no location is provided, show an error message
    if (!locationInput) {
      setLocationStatus('Please enter a location or use "Detect my location"');
      setStatusType('error');
      return;
    }
    
    setLocationStatus('Searching...');
    setStatusType('');
    
    // Always geocode the entered address to get coordinates
    try {
      const result = await geocodeAddress(locationInput);
      
      if (!result.success) {
        setLocationStatus('Could not find coordinates for this location. Please try a different address.');
        setStatusType('error');
        return;
      }
      
      // Transform to Coordinates format
      const coords: Coordinates = {
        latitude: result.lat,
        longitude: result.lon
      };
      
      // Save the coordinates for reference
      setCoordinates(coords);
      
      // Trigger search with the geocoded coordinates and current filters
      console.log('[SEARCH-DEBUG] Submitting search with geocoded coordinates:', coords, 'and filters:', filters);
      onSearch(coords, filters);
      
      // Show success message
      setLocationStatus('✓ Location found');
      setStatusType('success');
    } catch (error) {
      setLocationStatus('Error finding location. Please try again with a more specific address.');
      setStatusType('error');
      console.error('Geocoding error:', error);
    }
  };
  
  // Helper function to get button styles based on primary color
  const getButtonStyle = () => {
    if (!isClient) return {}; // Return empty object for server rendering
    
    return {
      backgroundColor: primaryColor,
      // Add hover effect by darkening the color slightly
      ':hover': {
        backgroundColor: `${primaryColor}e6` // Add transparency for hover effect
      }
    };
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">Find Notaries Near You</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Your Location
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="location"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter city, address, or zip code"
              value={locationInput}
              onChange={handleLocationInputChange}
              aria-describedby="location-status"
            />
            <button
              type="button"
              onClick={detectLocation}
              className="p-2 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
              aria-label="Detect my location"
              title="Use my current location"
            >
              📍
            </button>
          </div>
          
          {locationStatus && (
            <p 
              id="location-status" 
              className={`mt-1 text-sm ${
                statusType === 'success' ? 'text-green-600' : 
                statusType === 'error' ? 'text-red-600' : 'text-gray-500'
              }`}
            >
              {locationStatus}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="service-type" className="block text-sm font-medium text-gray-700 mb-1">
              Service Type
            </label>
            <select
              id="service-type"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filters.serviceType}
              onChange={handleServiceTypeChange}
            >
              <option value="">All Services</option>
              {availableServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="max-distance" className="block text-sm font-medium text-gray-700 mb-1">
              Maximum Distance (miles)
            </label>
            <select
              id="max-distance"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={filters.maxDistance}
              onChange={handleMaxDistanceChange}
            >
              <option value="10">10 miles</option>
              <option value="20">20 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
            </select>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="minimum-rating"
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              checked={filters.minimumRating}
              onChange={handleMinimumRatingToggle}
            />
            <label htmlFor="minimum-rating" className="ml-2 block text-sm text-gray-700">
              Only 3.5+ Stars
            </label>
          </div>
        </div>
        
        <button
          type="submit"
          className="w-full p-2 text-white rounded-md transition-colors"
          style={isClient ? { backgroundColor: primaryColor } : {}} // Apply dynamic styles client-side only
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : 'Search Notaries'}
        </button>
      </form>
    </div>
  );
}
