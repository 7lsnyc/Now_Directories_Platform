'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { geocodeAddress, getAddressFromCoordinates } from '@/utils/geocoding';
import { getProviderConfigFromSlug } from '@/types/provider';
import { Coordinates, SearchFilters } from '@/lib/providerSearchClient';

interface ProviderSearchFormProps {
  onSearch: (coordinates: Coordinates, filters: SearchFilters) => void;
  availableServices: string[];
  isLoading: boolean;
  primaryColor: string;
  directorySlug: string;
}

/**
 * ProviderSearchForm Component
 * Provides form inputs for location and filters to search for providers
 * Includes geolocation for detecting user's current location
 * Dynamically adjusts labels and defaults based on provider type
 */
export default function ProviderSearchForm({ 
  onSearch, 
  availableServices, 
  isLoading,
  primaryColor,
  directorySlug
}: ProviderSearchFormProps) {
  // Get provider configuration for this directory
  const providerConfig = getProviderConfigFromSlug(directorySlug);
  
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
    maxDistance: providerConfig.defaults.radius // Default from provider config
  });

  // Set isClient to true when component mounts on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle location input changes
  const handleLocationInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
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
      async (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        setCoordinates(coords);
        setLocationStatus('✓ Using your current location');
        setStatusType('success');
        
        // Immediately trigger search with the detected location and current filters
        onSearch(coords, filters);
        
        // Try to get a human-readable address for these coordinates
        try {
          const address = await getAddressFromCoordinates(coords.latitude, coords.longitude);
          
          if (address) {
            // Update the location input with the reverse geocoded address
            setLocationInput(address);
          } else {
            // If reverse geocoding fails, show the raw coordinates
            setLocationInput(`Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error('Error during reverse geocoding:', error);
          // Still show coordinates if reverse geocoding fails
          setLocationInput(`Lat: ${coords.latitude.toFixed(4)}, Lng: ${coords.longitude.toFixed(4)}`);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationStatus('Location access denied. Please check your browser settings or enter a location manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationStatus('Location information is unavailable. Please enter a location manually.');
            break;
          case error.TIMEOUT:
            setLocationStatus('Location request timed out. Please try again or enter a location manually.');
            break;
          default:
            setLocationStatus('An unknown error occurred. Please enter a location manually.');
            break;
        }
        
        setStatusType('error');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      return; // Prevent multiple submissions
    }
    
    // Check if we already have coordinates from geolocation
    if (coordinates) {
      onSearch(coordinates, filters);
      return;
    }
    
    if (!locationInput.trim()) {
      setLocationStatus('Please enter a location');
      setStatusType('error');
      return;
    }
    
    try {
      setLocationStatus('Searching...');
      setStatusType('');
      
      // Geocode the address to get coordinates
      const result = await geocodeAddress(locationInput);
      
      if (!result) {
        setLocationStatus('Could not find this location. Please try a more specific address.');
        setStatusType('error');
        return;
      }
      
      const newCoordinates = {
        latitude: result.lat,
        longitude: result.lon
      };
      
      setCoordinates(newCoordinates);
      setLocationStatus('✓ Location found');
      setStatusType('success');
      
      // Trigger search with the geocoded coordinates and current filters
      onSearch(newCoordinates, filters);
    } catch (error) {
      console.error('Error during geocoding:', error);
      setLocationStatus('Error finding location. Please try a different address.');
      setStatusType('error');
    }
  };

  // Helper function to get button styles based on primary color
  const getButtonStyle = () => {
    return {
      backgroundColor: primaryColor,
      ':hover': {
        backgroundColor: `${primaryColor}e6` // Add transparency for hover effect
      }
    };
  };

  // Extract labels and titles from provider configuration
  const searchTitle = providerConfig.labels.searchTitle;
  const serviceLabel = providerConfig.labels.serviceLabel;

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold mb-4">{searchTitle}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
            Your Location
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              id="location"
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
          {/* Service Type Dropdown - Only show if this provider type has specializations */}
          {providerConfig.features.hasSpecializations && (
            <div>
              <label htmlFor="service-type" className="block text-sm font-medium text-gray-700 mb-1">
                {serviceLabel}
              </label>
              <select
                id="service-type"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={filters.serviceType}
                onChange={handleServiceTypeChange}
              >
                <option value="">All {providerConfig.labels.plural}</option>
                {availableServices.map(service => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>
          )}
          
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
        
        {/* Rating Filter - Only show if this provider type has ratings */}
        {providerConfig.features.hasRatings && (
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
                Only {providerConfig.defaults.minimumRating}+ Stars
              </label>
            </div>
          </div>
        )}
        
        <button
          type="submit"
          className="w-full p-2 text-white rounded-md transition-colors"
          style={isClient ? { backgroundColor: primaryColor } : {}} // Apply dynamic styles client-side only
          disabled={isLoading}
        >
          {isLoading ? 'Searching...' : `Search ${providerConfig.labels.plural}`}
        </button>
      </form>
    </div>
  );
}
