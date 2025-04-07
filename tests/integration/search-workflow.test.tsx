/**
 * Integration tests for the Notary search workflow
 * 
 * Tests the full flow:
 * 1. Supabase query
 * 2. Distance filtering
 * 3. Results display
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotaryList from '@/components/notary/NotaryList';
import * as geocodingUtils from '@/utils/geocoding';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => {
  const actualSupabase = jest.requireActual('@supabase/supabase-js');
  return {
    ...actualSupabase,
    createClient: jest.fn().mockImplementation(() => ({
      from: jest.fn().mockImplementation((table) => ({
        select: jest.fn().mockImplementation(() => ({
          eq: jest.fn().mockImplementation(() => ({
            contains: jest.fn().mockImplementation(() => ({
              gte: jest.fn().mockImplementation(() => ({
                data: mockNotaryData,
                error: null
              })),
              data: mockNotaryData,
              error: null
            })),
            data: mockNotaryData,
            error: null
          }))
        }))
      }))
    }))
  };
});

// Mock geocoding utilities
jest.mock('@/utils/geocoding', () => ({
  geocodeAddress: jest.fn(),
  kmToMiles: jest.fn().mockImplementation((km) => km * 0.621371) // Simple conversion
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

// Mock notary data for testing
const mockNotaryData = [
  {
    id: 1,
    name: 'John Doe Notary',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    phone: '555-123-4567',
    email: 'john@example.com',
    website: 'https://example.com',
    services: ['Mobile Notary', 'Loan Signing'],
    rating: 4.8,
    review_count: 42,
    latitude: 40.7128,
    longitude: -74.0060,
    directory_slug: 'notaryfindernow',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 2,
    name: 'Jane Smith Notary',
    address: '456 Park Ave',
    city: 'New York',
    state: 'NY',
    zip: '10022',
    phone: '555-987-6543',
    email: 'jane@example.com',
    website: 'https://example.com/jane',
    services: ['Mobile Notary', 'Apostille'],
    rating: 4.2,
    review_count: 27,
    latitude: 40.7590,
    longitude: -73.9845,
    directory_slug: 'notaryfindernow',
    created_at: '2025-01-01T00:00:00Z'
  },
  {
    id: 3,
    name: 'Far Away Notary',
    address: '789 Distant Rd',
    city: 'Chicago',
    state: 'IL',
    zip: '60601',
    phone: '555-246-8101',
    email: 'far@example.com',
    website: 'https://example.com/far',
    services: ['Loan Signing'],
    rating: 3.9,
    review_count: 15,
    latitude: 41.8781,
    longitude: -87.6298, // Far from NY, should be filtered out by distance
    directory_slug: 'notaryfindernow',
    created_at: '2025-01-01T00:00:00Z'
  },
];

// Mock directory data
const mockDirectoryData = {
  id: 1,
  name: 'Notary Finder Now',
  directory_slug: 'notaryfindernow',
  domain: 'notaryfindernow.com',
  brand_color_primary: '#0047AB',
  is_active: true,
  created_at: '2025-01-01T00:00:00Z'
};

const mockThemeColors = {
  primary: '#0047AB',
  secondary: '#FFFFFF',
  accent: '#FFA500',
  text: '#333333',
  background: '#F5F5F5'
};

describe('Notary Search Workflow (Integration)', () => {
  const userCoordinates = { latitude: 40.7128, longitude: -74.0060 }; // NYC
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Explicitly setting process.env values for tests
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://mock.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'mock-key';
    
    // Set up the geolocation mock
    mockGeolocation.getCurrentPosition.mockImplementation((success) => {
      success({
        coords: userCoordinates
      });
    });
  });
  
  test('complete search workflow with results', async () => {
    // Render the NotaryList component
    render(
      <NotaryList 
        slug="notaryfindernow" 
        directoryData={mockDirectoryData} 
        themeColors={mockThemeColors} 
      />
    );
    
    // Wait for the NotaryList to be ready
    await waitFor(() => {
      expect(screen.getByText('Find Notaries Near You')).toBeInTheDocument();
    });
    
    // Use geolocation
    const detectButton = screen.getByLabelText('Detect my location');
    fireEvent.click(detectButton);
    
    // Wait for the search to complete
    await waitFor(() => {
      // Should show the success indicator
      expect(screen.getByText('✓ Using your current location')).toBeInTheDocument();
    });
    
    // Use the Service Type filter
    const serviceTypeSelect = screen.getByLabelText('Service Type');
    fireEvent.change(serviceTypeSelect, { target: { value: 'Mobile Notary' } });
    
    // Click search button
    const searchButton = screen.getByText('Search Notaries');
    fireEvent.click(searchButton);
    
    // Wait for results to be displayed and check if nearby notaries are shown
    await waitFor(() => {
      // Should find 2 notaries (the Chicago one is too far and filtered out)
      expect(screen.getByText(/Found 2 notaries near you/i)).toBeInTheDocument();
      
      // Check if both NY notaries are shown
      expect(screen.getByText('John Doe Notary')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith Notary')).toBeInTheDocument();
      
      // The Chicago notary should be filtered out by distance
      expect(screen.queryByText('Far Away Notary')).not.toBeInTheDocument();
    });
  });
  
  test('search with no results in the area', async () => {
    // For this test, use coordinates far from all notaries
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: { latitude: 37.7749, longitude: -122.4194 } // San Francisco
      });
    });
    
    // Render the NotaryList component
    render(
      <NotaryList 
        slug="notaryfindernow" 
        directoryData={mockDirectoryData} 
        themeColors={mockThemeColors} 
      />
    );
    
    // Wait for the NotaryList to be ready
    await waitFor(() => {
      expect(screen.getByText('Find Notaries Near You')).toBeInTheDocument();
    });
    
    // Use geolocation
    const detectButton = screen.getByLabelText('Detect my location');
    fireEvent.click(detectButton);
    
    // Click search button
    const searchButton = screen.getByText('Search Notaries');
    fireEvent.click(searchButton);
    
    // Wait for "no results" message
    await waitFor(() => {
      expect(screen.getByText('No notaries found in your area')).toBeInTheDocument();
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
      
      // Should mention that notaries exist but none are within the search radius
      expect(screen.getByText(/Found 3 notaries, but none within 20 miles/i)).toBeInTheDocument();
    });
  });
  
  test('search with empty database', async () => {
    // Mock an empty response from Supabase for this test
    jest.spyOn(global, 'fetch').mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [], error: null })
      }) as any
    );
    
    // Render with empty data for this test only
    const originalFrom = jest.requireMock('@supabase/supabase-js').createClient().from;
    jest.requireMock('@supabase/supabase-js').createClient().from.mockImplementationOnce((table) => ({
      select: jest.fn().mockImplementation(() => ({
        eq: jest.fn().mockImplementation(() => ({
          data: [],
          error: null
        }))
      }))
    }));
    
    // Render the NotaryList component
    render(
      <NotaryList 
        slug="notaryfindernow" 
        directoryData={mockDirectoryData} 
        themeColors={mockThemeColors} 
      />
    );
    
    // Wait for the NotaryList to be ready
    await waitFor(() => {
      expect(screen.getByText('Find Notaries Near You')).toBeInTheDocument();
    });
    
    // Use geolocation
    const detectButton = screen.getByLabelText('Detect my location');
    fireEvent.click(detectButton);
    
    // Click search button
    const searchButton = screen.getByText('Search Notaries');
    fireEvent.click(searchButton);
    
    // Should show message about no notaries in the database
    await waitFor(() => {
      expect(screen.getByText('No notaries found in your area')).toBeInTheDocument();
      expect(screen.getByText(/No notaries found in the database for this directory/i)).toBeInTheDocument();
    });
    
    // Restore the original mock
    jest.requireMock('@supabase/supabase-js').createClient().from = originalFrom;
  });
  
  test('applies multiple filters correctly', async () => {
    // Render the NotaryList component
    render(
      <NotaryList 
        slug="notaryfindernow" 
        directoryData={mockDirectoryData} 
        themeColors={mockThemeColors} 
      />
    );
    
    // Wait for the NotaryList to be ready
    await waitFor(() => {
      expect(screen.getByText('Find Notaries Near You')).toBeInTheDocument();
    });
    
    // Enter a location manually
    const locationInput = screen.getByLabelText('Your Location');
    fireEvent.change(locationInput, { target: { value: 'New York, NY' } });
    
    // Mock successful geocoding
    (geocodingUtils.geocodeAddress as jest.Mock).mockResolvedValueOnce({
      lat: 40.7128,
      lon: -74.0060,
      success: true
    });
    
    // Apply all filters
    const serviceTypeSelect = screen.getByLabelText('Service Type');
    fireEvent.change(serviceTypeSelect, { target: { value: 'Loan Signing' } });
    
    const ratingCheckbox = screen.getByLabelText('Only 3.5+ Stars');
    fireEvent.click(ratingCheckbox);
    
    const maxDistanceSelect = screen.getByLabelText('Maximum Distance (miles)');
    fireEvent.change(maxDistanceSelect, { target: { value: '10' } });
    
    // Click search button
    const searchButton = screen.getByText('Search Notaries');
    fireEvent.click(searchButton);
    
    // Wait for filtered results
    await waitFor(() => {
      // Should only show notaries that match all criteria
      expect(screen.getByText('John Doe Notary')).toBeInTheDocument(); // Matches all criteria
      
      // Jane Smith doesn't offer Loan Signing
      expect(screen.queryByText('Jane Smith Notary')).not.toBeInTheDocument();
      
      // Far Away Notary is too far
      expect(screen.queryByText('Far Away Notary')).not.toBeInTheDocument();
    });
  });
});
