/**
 * Unit tests for NotarySearchForm component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotarySearchForm from '@/components/notary/NotarySearchForm';
import * as geocodingUtils from '@/utils/geocoding';

// Mock geocoding utilities
jest.mock('@/utils/geocoding', () => ({
  geocodeAddress: jest.fn(),
}));

// Mock the geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

// Replace the global navigator.geolocation with our mock
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

describe('NotarySearchForm', () => {
  const mockOnSearch = jest.fn();
  const mockAvailableServices = ['Mobile Notary', 'Loan Signing', 'Apostille'];
  const mockPrimaryColor = '#0047AB'; // Default test primary color
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  test('renders the search form correctly', () => {
    render(
      <NotarySearchForm 
        onSearch={mockOnSearch} 
        availableServices={mockAvailableServices}
        isLoading={false}
        primaryColor={mockPrimaryColor}
      />
    );
    
    // Check that the form elements are rendered
    expect(screen.getByText('Find Notaries Near You')).toBeInTheDocument();
    expect(screen.getByLabelText('Your Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Service Type')).toBeInTheDocument();
    expect(screen.getByLabelText('Only 3.5+ Stars')).toBeInTheDocument();
    expect(screen.getByText('Search Notaries')).toBeInTheDocument();
  });
  
  test('handles geolocation request correctly', async () => {
    // Set up the mock to simulate successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      });
    });
    
    render(
      <NotarySearchForm 
        onSearch={mockOnSearch} 
        availableServices={mockAvailableServices}
        isLoading={false}
        primaryColor={mockPrimaryColor}
      />
    );
    
    // Click the detect location button
    const detectButton = screen.getByLabelText('Detect my location');
    fireEvent.click(detectButton);
    
    // Wait for the geolocation to complete and trigger onSearch
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        { latitude: 40.7128, longitude: -74.0060 },
        { serviceType: '', minimumRating: false, maxDistance: 20 }
      );
    });
    
    // Success message should be displayed
    expect(screen.getByText('✓ Using your current location')).toBeInTheDocument();
  });
  
  test('handles geolocation error correctly', async () => {
    // Set up the mock to simulate permission denied
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success, error) => {
      error({
        code: 1,
        message: 'User denied geolocation'
      });
    });
    
    render(
      <NotarySearchForm 
        onSearch={mockOnSearch} 
        availableServices={mockAvailableServices}
        isLoading={false}
        primaryColor={mockPrimaryColor}
      />
    );
    
    // Click the detect location button
    const detectButton = screen.getByLabelText('Detect my location');
    fireEvent.click(detectButton);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Location access was denied. Please enter your location manually.')).toBeInTheDocument();
    });
    
    // onSearch should not have been called
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
  
  test('handles manual location search correctly', async () => {
    // Mock the geocodeAddress function to return successful coordinates
    (geocodingUtils.geocodeAddress as jest.Mock).mockResolvedValueOnce({
      lat: 34.0522,
      lon: -118.2437,
      success: true
    });
    
    render(
      <NotarySearchForm 
        onSearch={mockOnSearch} 
        availableServices={mockAvailableServices}
        isLoading={false}
        primaryColor={mockPrimaryColor}
      />
    );
    
    // Enter a location manually
    const locationInput = screen.getByLabelText('Your Location');
    fireEvent.change(locationInput, { target: { value: 'Los Angeles, CA' } });
    
    // Submit the form
    const searchButton = screen.getByText('Search Notaries');
    fireEvent.click(searchButton);
    
    // Wait for the form submission to complete
    await waitFor(() => {
      expect(geocodingUtils.geocodeAddress).toHaveBeenCalledWith('Los Angeles, CA');
      expect(mockOnSearch).toHaveBeenCalledWith(
        { latitude: 34.0522, longitude: -118.2437 },
        { serviceType: '', minimumRating: false, maxDistance: 20 }
      );
    });
  });
  
  test('handles geocoding error correctly', async () => {
    // Mock the geocodeAddress function to return an error
    (geocodingUtils.geocodeAddress as jest.Mock).mockResolvedValueOnce({
      lat: 0,
      lon: 0,
      success: false,
      error: 'Location not found'
    });
    
    render(
      <NotarySearchForm 
        onSearch={mockOnSearch} 
        availableServices={mockAvailableServices}
        isLoading={false}
        primaryColor={mockPrimaryColor}
      />
    );
    
    // Enter a location manually
    const locationInput = screen.getByLabelText('Your Location');
    fireEvent.change(locationInput, { target: { value: 'Invalid Location' } });
    
    // Submit the form
    const searchButton = screen.getByText('Search Notaries');
    fireEvent.click(searchButton);
    
    // Wait for the error message to be displayed
    await waitFor(() => {
      expect(screen.getByText('Location not found')).toBeInTheDocument();
    });
    
    // onSearch should not have been called
    expect(mockOnSearch).not.toHaveBeenCalled();
  });
  
  test('applies filters correctly', async () => {
    // Set up successful geolocation
    mockGeolocation.getCurrentPosition.mockImplementationOnce((success) => {
      success({
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      });
    });
    
    render(
      <NotarySearchForm 
        onSearch={mockOnSearch} 
        availableServices={mockAvailableServices}
        isLoading={false}
        primaryColor={mockPrimaryColor}
      />
    );
    
    // Select a service type
    const serviceTypeSelect = screen.getByLabelText('Service Type');
    fireEvent.change(serviceTypeSelect, { target: { value: 'Mobile Notary' } });
    
    // Select a max distance
    const maxDistanceSelect = screen.getByLabelText('Maximum Distance (miles)');
    fireEvent.change(maxDistanceSelect, { target: { value: '50' } });
    
    // Check the minimum rating checkbox
    const ratingCheckbox = screen.getByLabelText('Only 3.5+ Stars');
    fireEvent.click(ratingCheckbox);
    
    // Submit the form
    const searchButton = screen.getByText('Search Notaries');
    fireEvent.click(searchButton);
    
    // Wait for the filters to be applied
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith(
        expect.any(Object),
        { serviceType: 'Mobile Notary', minimumRating: true, maxDistance: 50 }
      );
    });
  });
});
