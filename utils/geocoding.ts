/**
 * Geocoding utilities for converting addresses into coordinates
 * Uses Nominatim (OpenStreetMap) as a free geocoding service
 * and Google Maps API (via server API route) for reverse geocoding
 */

interface GeocodingResult {
  lat: number;
  lon: number;
  success: boolean;
  error?: string;
}

/**
 * Convert an address (city, zip, etc.) to latitude and longitude coordinates
 * Uses Nominatim (OpenStreetMap) free geocoding service 
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    // Validate and sanitize input
    if (!address || address.trim().length < 2) {
      return { 
        lat: 0, 
        lon: 0, 
        success: false, 
        error: 'Address is too short or empty' 
      };
    }
    
    // Use Nominatim for geocoding (OpenStreetMap's free geocoding service)
    // Follows Nominatim usage policy by identifying our application
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'Now-Directories-Platform/1.0',
          'Accept-Language': 'en-US,en'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Geocoding failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we got any results
    if (!data || data.length === 0) {
      return { 
        lat: 0, 
        lon: 0, 
        success: false, 
        error: 'No locations found for this address' 
      };
    }
    
    // Return the coordinates from the first result
    return {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      success: true
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      lat: 0,
      lon: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown geocoding error'
    };
  }
}

/**
 * Calculate the distance between two coordinate points using the Haversine formula
 * Result is in kilometers
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
}

/**
 * Convert kilometers to miles
 */
export function kmToMiles(km: number): number {
  return km * 0.621371;
}

/**
 * Convert miles to kilometers
 */
export function milesToKm(miles: number): number {
  return miles / 0.621371;
}

/**
 * Convert coordinates to a human-readable address using reverse geocoding
 * Uses our secure API route proxy to call Google Maps API with server-side API key
 */
export async function getAddressFromCoordinates(latitude: number, longitude: number): Promise<string | null> {
  try {
    // Call our own API route which securely proxies to Google Maps
    const response = await fetch(`/api/geocode/reverse?lat=${latitude}&lng=${longitude}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Reverse geocoding error:', response.status, errorData);
      return null;
    }
    
    const data = await response.json();
    
    // Return the address if available
    if (data && typeof data.address === 'string' && data.address.trim()) {
      return data.address;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting address from coordinates:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}
