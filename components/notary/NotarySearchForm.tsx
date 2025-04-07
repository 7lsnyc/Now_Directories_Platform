'use client';

import { useState, useEffect } from 'react';
import { geocodeAddress } from '@/utils/geocoding';
import { validateInput } from '@/lib/security/securityMiddleware';

interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface SearchFilters {
  serviceType: string;
  minimumRating: boolean;
}

interface NotarySearchFormProps {
  onSearch: (coords: Coordinates, filters: SearchFilters) => void;
  availableServices: string[];
  isLoading: boolean;
}

/**
 * Notary search form with geolocation functionality
 * Provides location detection via browser API and address text input fallback
 */
export default function NotarySearchForm({ 
  onSearch, 
  availableServices, 
  isLoading 
}: NotarySearchFormProps) {
  // Location state
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [locationInput, setLocationInput] = useState('');
  const [locationError, setLocationError] = useState<string>('');
  const [isGeolocating, setIsGeolocating] = useState(false);

  // Filter states
  const [serviceType, setServiceType] = useState<string>('');
  const [minimumRating, setMinimumRating] = useState(false);
  
  // Geolocation status
  const [geolocationStatus, setGeolocationStatus] = useState<
    'prompt' | 'detecting' | 'success' | 'error' | 'denied'
  >('prompt');

  // Check if geolocation is supported by the browser
  const isGeolocationSupported = typeof navigator !== 'undefined' && 'geolocation' in navigator;

  /**
   * Request user's location using browser geolocation API
   */
  const detectLocation = () => {
    if (!isGeolocationSupported) {
      setGeolocationStatus('error');
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    setIsGeolocating(true);
    setGeolocationStatus('detecting');

    navigator.geolocation.getCurrentPosition(
      // Success handler
      (position) => {
        setCoordinates({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGeolocationStatus('success');
        setIsGeolocating(false);
        
        // Auto-search when location is detected
        onSearch(
          {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          },
          { serviceType, minimumRating }
        );
      },
      // Error handler
      (error) => {
        console.error('Geolocation error:', error);
        setIsGeolocating(false);
        
        if (error.code === 1) {
          // Permission denied
          setGeolocationStatus('denied');
          setLocationError('Location access was denied. Please enter your location manually.');
        } else {
          // Other errors
          setGeolocationStatus('error');
          setLocationError(
            error.message || 'Unable to get your location. Please enter it manually.'
          );
        }
      },
      // Options
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Handle manual location search with text input
   */
  const handleManualSearch = async () => {
    if (!locationInput.trim()) {
      setLocationError('Please enter a location.');
      return;
    }

    // Security: Validate input to prevent SQL injection
    const sanitizedInput = validateInput(locationInput, 'generic');
    if (!sanitizedInput) {
      setLocationError('Invalid location format. Please try again.');
      return;
    }

    setIsGeolocating(true);
    setLocationError('');

    // Convert address to coordinates
    const result = await geocodeAddress(sanitizedInput);
    
    if (result.success) {
      const newCoords = {
        latitude: result.lat,
        longitude: result.lon
      };
      
      setCoordinates(newCoords);
      setGeolocationStatus('success');
      onSearch(newCoords, { serviceType, minimumRating });
    } else {
      setLocationError(result.error || 'Location not found. Please try a different address.');
    }
    
    setIsGeolocating(false);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (coordinates) {
      // If we already have coordinates, search with filters
      onSearch(coordinates, { serviceType, minimumRating });
    } else {
      // Otherwise, try manual search
      handleManualSearch();
    }
  };

  // Try to get user's location on first load
  useEffect(() => {
    if (isGeolocationSupported) {
      // Wait a moment before prompting for location to allow page to load
      const timer = setTimeout(() => {
        detectLocation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <h2 className="text-xl font-semibold mb-4 text-theme-primary">Find Notaries Near You</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Location input */}
        <div className="space-y-2">
          <label 
            htmlFor="location-input" 
            className="block text-sm font-medium text-gray-700"
          >
            Your Location
          </label>
          
          <div className="flex space-x-2">
            <input
              id="location-input"
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              placeholder="Enter city, state or zip code"
              className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 
                        shadow-sm focus:outline-none focus:ring-theme-primary focus:border-theme-primary"
              aria-describedby="location-error"
              disabled={isGeolocating || geolocationStatus === 'detecting'}
            />
            
            {isGeolocationSupported && (
              <button
                type="button"
                onClick={detectLocation}
                disabled={isGeolocating || geolocationStatus === 'detecting'}
                className="inline-flex items-center px-4 py-2 border border-transparent 
                          text-sm font-medium rounded-md shadow-sm text-white bg-theme-primary 
                          hover:bg-theme-primary/90 focus:outline-none focus:ring-2 
                          focus:ring-offset-2 focus:ring-theme-primary disabled:opacity-50"
                aria-label="Detect my location"
              >
                {geolocationStatus === 'detecting' ? 'Detecting...' : 'Detect Location'}
              </button>
            )}
          </div>
          
          {/* Location status messages */}
          {geolocationStatus === 'success' && (
            <p className="text-sm text-green-600">
              ✓ Using your current location
            </p>
          )}
          
          {locationError && (
            <p id="location-error" className="text-sm text-red-600">
              {locationError}
            </p>
          )}
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service type filter */}
          <div>
            <label 
              htmlFor="service-type" 
              className="block text-sm font-medium text-gray-700"
            >
              Service Type
            </label>
            <select
              id="service-type"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 
                        focus:outline-none focus:ring-theme-primary focus:border-theme-primary 
                        rounded-md"
              aria-label="Filter by service type"
            >
              <option value="">All Services</option>
              {availableServices.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </select>
          </div>
          
          {/* Rating filter */}
          <div className="flex items-center h-full pt-6">
            <input
              id="minimum-rating"
              type="checkbox"
              checked={minimumRating}
              onChange={(e) => setMinimumRating(e.target.checked)}
              className="h-4 w-4 text-theme-primary focus:ring-theme-primary border-gray-300 rounded"
              aria-label="Only show notaries with 3.5+ stars rating"
            />
            <label 
              htmlFor="minimum-rating" 
              className="ml-2 block text-sm text-gray-700"
            >
              Only 3.5+ Stars
            </label>
          </div>
        </div>
        
        {/* Submit button */}
        <div>
          <button
            type="submit"
            disabled={isLoading || isGeolocating}
            className="w-full flex justify-center py-2 px-4 border border-transparent 
                      rounded-md shadow-sm text-sm font-medium text-white bg-theme-accent 
                      hover:bg-theme-accent/90 focus:outline-none focus:ring-2 focus:ring-offset-2 
                      focus:ring-theme-accent disabled:opacity-50"
            aria-label="Search for notaries"
          >
            {isLoading ? 'Searching...' : 'Search Notaries'}
          </button>
        </div>
      </form>
    </div>
  );
}
