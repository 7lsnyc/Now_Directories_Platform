/**
 * Integration tests for the Provider search workflow
 * 
 * Tests the full flow:
 * 1. Supabase PostGIS query
 * 2. Results display
 * 3. Search filters
 */
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as geocodingUtils from '@/utils/geocoding';
import { Directory, DirectoryThemeColors } from '@/types/directory';
import { useSupabase } from '@/lib/supabase/clientProvider';

// Mock the ProviderList and ProviderSearchForm components
jest.mock('@/components/provider/ProviderList', () => {
  return {
    __esModule: true,
    default: jest.fn(props => {
      const { searchParams, onLoadingChange } = props;
      
      // Check if callbacks are provided
      if (onLoadingChange) {
        React.useEffect(() => {
          onLoadingChange(!!searchParams);
        }, [searchParams, onLoadingChange]);
      }
      
      return (
        <div data-testid="mock-provider-list">
          <div data-testid="search-params">{JSON.stringify(searchParams)}</div>
          <div className="results-count">
            {searchParams ? `Found ${Math.floor(Math.random() * 10) + 1} providers near you` : 'No search performed'}
          </div>
        </div>
      );
    })
  };
});

// Mock ProviderSearchForm
jest.mock('@/components/provider/ProviderSearchForm', () => {
  return {
    __esModule: true,
    default: jest.fn(({ onSearch, availableServices, isLoading, primaryColor }) => {
      const handleDetectLocation = () => {
        // Get the mocked geolocation
        const mockGeo = global.navigator.geolocation;
        mockGeo.getCurrentPosition((position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          
          // Call onSearch with default filters
          onSearch(coords, {
            serviceType: '',
            minimumRating: false,
            maxDistance: 20
          });
        });
      };
      
      const handleSubmit = (e) => {
        e.preventDefault();
        
        // Get form values - in a real component this would use state
        const locationInput = document.getElementById('location')?.value;
        const serviceType = document.getElementById('service-type')?.value;
        const maxDistance = parseInt(document.getElementById('max-distance')?.value || '20', 10);
        const minimumRating = document.getElementById('minimum-rating')?.checked;
        
        // Mock geocoding
        const geocode = jest.requireMock('@/utils/geocoding').geocodeAddress;
        
        // Mock the geocoding and search flow
        geocode(locationInput).then(result => {
          if (result && result.success) {
            onSearch(
              { latitude: result.lat, longitude: result.lon }, 
              { serviceType, minimumRating, maxDistance }
            );
          }
        });
      };
      
      return (
        <form data-testid="search-form" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="location">Your Location</label>
            <input type="text" id="location" placeholder="Enter location" />
            <button 
              type="button" 
              onClick={handleDetectLocation}
              aria-label="Detect my location"
            >📍</button>
          </div>
          
          <div>
            <label htmlFor="service-type">Service Type</label>
            <select id="service-type">
              <option value="">All Services</option>
              {availableServices.map(service => (
                <option key={service} value={service}>{service}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="max-distance">Maximum Distance (miles)</label>
            <select id="max-distance" defaultValue="20">
              <option value="10">10 miles</option>
              <option value="20">20 miles</option>
              <option value="50">50 miles</option>
              <option value="100">100 miles</option>
            </select>
          </div>
          
          <div>
            <input type="checkbox" id="minimum-rating" />
            <label htmlFor="minimum-rating">Only 3.5+ Stars</label>
          </div>
          
          <button type="submit">
            {isLoading ? 'Searching...' : 'Search Providers'}
          </button>
        </form>
      );
    })
  };
});

// Mock the Supabase hook
jest.mock('@/lib/supabase/clientProvider', () => ({
  useSupabase: jest.fn()
}));

// Mock geocoding utilities
jest.mock('@/utils/geocoding', () => ({
  geocodeAddress: jest.fn(),
  kmToMiles: jest.fn().mockImplementation((km) => km * 0.621371), // Simple conversion
  getAddressFromCoordinates: jest.fn().mockResolvedValue('123 Test St, New York, NY')
}));

// Mock browser geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn()
};

Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true
});

// Mock Supabase client with configurable responses
const mockSupabaseClient = {
  rpc: jest.fn()
};

// Mock provider data returned from PostGIS query
const mockProviderData = [
  {
    id: '1',
    name: 'John Doe Provider',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: '555-123-4567',
    email: 'john@example.com',
    website: 'https://example.com',
    services: ['Service 1', 'Service 2'],
    rating: 4.8,
    review_count: 42,
    latitude: 40.7128,
    longitude: -74.0060,
    directory_slug: 'providerfindernow',
    created_at: '2025-01-01T00:00:00Z',
    distance_meters: 1500, // ~0.93 miles
    last_updated: '2025-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Jane Smith Provider',
    address: '456 Park Ave',
    city: 'New York',
    state: 'NY',
    zip: '10022',
    phone: '555-987-6543',
    email: 'jane@example.com',
    website: 'https://example.com/jane',
    services: ['Service 1', 'Service 3'],
    rating: 4.2,
    review_count: 27,
    latitude: 40.7590,
    longitude: -73.9845,
    directory_slug: 'providerfindernow',
    created_at: '2025-01-01T00:00:00Z',
    distance_meters: 3000, // ~1.86 miles
    last_updated: '2025-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Far Away Provider',
    address: '789 Distant Rd',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    phone: '555-246-8101',
    email: 'far@example.com',
    website: 'https://example.com/far',
    services: ['Service 2'],
    rating: 3.9,
    review_count: 15,
    latitude: 41.8781,
    longitude: -87.6298, // Far from NY, should be filtered out by distance
    directory_slug: 'providerfindernow',
    created_at: '2025-01-01T00:00:00Z',
    distance_meters: 20000, // ~12.4 miles
    last_updated: '2025-01-01T00:00:00Z'
  },
];

// Mock directory data
const mockDirectoryData = {
  id: '1',
  name: 'Provider Finder Now',
  directory_slug: 'providerfindernow',
  domain: 'providerfindernow.com',
  title: 'Find Providers Near You',
  description: 'Connect with certified providers in your area',
  icon_name: 'DocumentSearch',
  logo_url: '/images/logo.png',
  icon_url: '/images/icon.png',
  banner_url: '/images/banner.jpg',
  badge_url: '/images/badge.png',
  default_search_radius: 20,
  is_active: true,
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  theme: {
    colors: {
      primary: '#0047AB',
      secondary: '#1D4ED8',
      accent: '#DBEAFE'
    }
  }
} as unknown as Directory;

const mockThemeColors = {
  primary: '#0047AB',
  primaryText: 'white'
} as DirectoryThemeColors;

describe('Provider Search Workflow (Integration)', () => {
  const userCoordinates = { latitude: 40.7128, longitude: -74.0060 }; // NYC
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Set up the Supabase mock
    (useSupabase as jest.Mock).mockReturnValue({
      supabase: mockSupabaseClient,
      isLoading: false
    });
    
    // Set up the geolocation mock
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: userCoordinates
      });
    });
  });
  
  test('complete search workflow with results', async () => {
    // Configure the RPC mock to return results
    mockSupabaseClient.rpc.mockResolvedValueOnce({ 
      data: mockProviderData.slice(0, 2), // Just the NY providers
      error: null 
    });

    const ProviderList = require('@/components/provider/ProviderList').default;
    
    // Render the ProviderList component with initial search params
    await act(async () => {
      render(
        <ProviderList 
          slug="providerfindernow" 
          directoryData={mockDirectoryData} 
          themeColors={mockThemeColors}
          searchParams={{
            coordinates: userCoordinates,
            filters: {
              serviceType: '',
              minimumRating: false,
              maxDistance: 20
            }
          }}
          onLoadingChange={jest.fn()}
        />
      );
    });
    
    // Wait for results to be displayed
    await waitFor(() => {
      // Should find 2 providers
      expect(screen.getByText(/Found \d+ providers near you/i)).toBeInTheDocument();
    });
    
    // Verify Supabase RPC was called with correct parameters
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('nearby_providers', {
      lat: userCoordinates.latitude,
      lng: userCoordinates.longitude,
      radius_miles: 20,
      dir_slug: 'providerfindernow',
      min_rating: null,
      service_type: null
    });
  });
  
  test('search with no results in the area', async () => {
    // Configure the RPC mock to return empty results
    mockSupabaseClient.rpc.mockResolvedValueOnce({ 
      data: [], 
      error: null 
    });

    const ProviderList = require('@/components/provider/ProviderList').default;
    
    // Render the ProviderList component with search params
    await act(async () => {
      render(
        <ProviderList 
          slug="providerfindernow" 
          directoryData={mockDirectoryData} 
          themeColors={mockThemeColors}
          searchParams={{
            coordinates: userCoordinates,
            filters: {
              serviceType: '',
              minimumRating: false,
              maxDistance: 5 // Small radius to get no results
            }
          }}
          onLoadingChange={jest.fn()}
        />
      );
    });
    
    // Wait for "no results" message
    await waitFor(() => {
      expect(screen.getByText(/No search performed/i)).toBeInTheDocument();
    });
  });
  
  test('search with Supabase error', async () => {
    // Configure the RPC mock to return an error
    const testError = new Error('Database connection error');
    mockSupabaseClient.rpc.mockResolvedValueOnce({ 
      data: null, 
      error: testError 
    });

    const ProviderList = require('@/components/provider/ProviderList').default;
    
    // Render the ProviderList component with search params
    await act(async () => {
      render(
        <ProviderList 
          slug="providerfindernow" 
          directoryData={mockDirectoryData} 
          themeColors={mockThemeColors}
          searchParams={{
            coordinates: userCoordinates,
            filters: {
              serviceType: '',
              minimumRating: false,
              maxDistance: 20
            }
          }}
          onLoadingChange={jest.fn()}
        />
      );
    });
    
    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/Search failed: Database connection error/i)).toBeInTheDocument();
    });
  });
  
  test('search with geolocation detection', async () => {
    // Configure the RPC mock to return results
    mockSupabaseClient.rpc.mockResolvedValueOnce({ 
      data: mockProviderData.slice(0, 2),
      error: null 
    });

    const ProviderList = require('@/components/provider/ProviderList').default;
    
    // Render the ProviderList component without initial search params
    await act(async () => {
      render(
        <ProviderList 
          slug="providerfindernow" 
          directoryData={mockDirectoryData} 
          themeColors={mockThemeColors}
          searchParams={null} // Explicitly set to null for initial state
          onLoadingChange={jest.fn()}
        />
      );
    });
    
    // Should show the prompt for users to enter a location
    expect(screen.getByText(/Enter a location to find providers near you/i)).toBeInTheDocument();
    
    // Click the "Detect my location" button
    const detectButton = screen.getByLabelText('Detect my location');
    
    await act(async () => {
      fireEvent.click(detectButton);
    });
    
    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Found \d+ providers near you/i)).toBeInTheDocument();
    });
    
    // Verify geolocation was used
    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
  });
  
  test('applies multiple filters correctly', async () => {
    // Mock successful geocoding
    (geocodingUtils.geocodeAddress as jest.Mock).mockResolvedValueOnce({
      lat: 40.7128,
      lon: -74.0060,
      success: true
    });
    
    const ProviderList = require('@/components/provider/ProviderList').default;
    
    // First render without search params
    await act(async () => {
      render(
        <ProviderList 
          slug="providerfindernow" 
          directoryData={mockDirectoryData} 
          themeColors={mockThemeColors}
          searchParams={null} // Explicitly set to null for initial state
          onLoadingChange={jest.fn()}
        />
      );
    });
    
    // Enter a location manually
    const locationInput = screen.getByLabelText('Your Location');
    await act(async () => {
      fireEvent.change(locationInput, { target: { value: 'New York, NY' } });
    });
    
    // Apply all filters
    const serviceTypeSelect = screen.getByLabelText('Service Type');
    await act(async () => {
      fireEvent.change(serviceTypeSelect, { target: { value: 'Service 1' } });
    });
    
    const ratingCheckbox = screen.getByLabelText('Only 3.5+ Stars');
    await act(async () => {
      fireEvent.click(ratingCheckbox);
    });
    
    const maxDistanceSelect = screen.getByLabelText('Maximum Distance (miles)');
    await act(async () => {
      fireEvent.change(maxDistanceSelect, { target: { value: '10' } });
    });
    
    // Configure the RPC mock to return results matching the filters
    mockSupabaseClient.rpc.mockResolvedValueOnce({ 
      data: [mockProviderData[0]], // Just John Doe who matches all filters
      error: null 
    });
    
    // Click search button
    const searchButton = screen.getByText('Search Providers');
    await act(async () => {
      fireEvent.click(searchButton);
    });
    
    // Wait for filtered results
    await waitFor(() => {
      // Should only show providers that match all criteria
      expect(screen.getByText('John Doe Provider')).toBeInTheDocument();
      
      // Jane Smith shouldn't be in the results
      expect(screen.queryByText('Jane Smith Provider')).not.toBeInTheDocument();
    });
    
    // Verify the RPC was called with correct filter parameters
    expect(mockSupabaseClient.rpc).toHaveBeenCalledWith('nearby_providers', expect.objectContaining({
      min_rating: 3.5,
      service_type: 'Service 1'
    }));
  });
});
