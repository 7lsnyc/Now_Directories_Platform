/**
 * Unit tests for NotaryListWrapper component
 */
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotaryListWrapper from '@/components/notary/NotaryListWrapper';
import { DirectoryProvider } from '@/contexts/directory/DirectoryContext';

// Mock the dynamic import of NotaryList
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => <div data-testid="mock-notary-list">Mock NotaryList Component</div>;
  DynamicComponent.displayName = 'NotaryList';
  return DynamicComponent;
});

// Mock directory context values for testing
const mockDirectoryData = {
  id: 1,
  name: 'Notary Finder Now',
  directory_slug: 'notaryfindernow',
  brand_color_primary: '#0047AB',
  is_active: true,
  created_at: '2025-01-01T00:00:00.000Z',
  domain: 'notaryfindernow.com'
};

const mockThemeColors = {
  primary: '#0047AB',
  secondary: '#FFFFFF',
  accent: '#FFA500',
  text: '#333333',
  background: '#F5F5F5'
};

describe('NotaryListWrapper', () => {
  // Setup mock for useEffect to simulate client-side rendering
  const originalUseEffect = React.useEffect;
  const mockUseEffect = jest.fn();

  beforeAll(() => {
    // Replace useEffect with our mock that immediately executes the callback
    React.useEffect = mockUseEffect.mockImplementation((callback) => {
      callback();
      return () => {};
    });
  });

  afterAll(() => {
    // Restore original useEffect after tests
    React.useEffect = originalUseEffect;
  });

  test('renders the NotaryListPlaceholder when loading', () => {
    render(
      <DirectoryProvider initialDirectory={null}>
        <NotaryListWrapper slug="notaryfindernow" />
      </DirectoryProvider>
    );
    
    // Placeholder elements should be in the document
    expect(screen.getByTestId('mock-notary-list')).toBeInTheDocument();
  });

  test('passes correct props from directory context', async () => {
    // Create a spy on console.warn to catch any warnings
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    render(
      <DirectoryProvider 
        initialDirectory={mockDirectoryData}
        initialThemeColors={mockThemeColors}
      >
        <NotaryListWrapper slug="notaryfindernow" />
      </DirectoryProvider>
    );
    
    await waitFor(() => {
      // The component should be rendered
      expect(screen.getByTestId('mock-notary-list')).toBeInTheDocument();
    });
    
    // No warnings about slug mismatch should be logged
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  test('warns when there is a slug mismatch', async () => {
    // Create a spy on console.warn to catch warnings
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    
    render(
      <DirectoryProvider 
        initialDirectory={mockDirectoryData}
        initialThemeColors={mockThemeColors}
      >
        <NotaryListWrapper slug="different-slug" />
      </DirectoryProvider>
    );
    
    await waitFor(() => {
      // Verify the warning was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slug mismatch')
      );
    });
    
    consoleSpy.mockRestore();
  });

  test('handles null directory data correctly', async () => {
    render(
      <DirectoryProvider initialDirectory={null}>
        <NotaryListWrapper slug="notaryfindernow" />
      </DirectoryProvider>
    );
    
    await waitFor(() => {
      // The component should still render without errors
      expect(screen.getByTestId('mock-notary-list')).toBeInTheDocument();
    });
  });
});
