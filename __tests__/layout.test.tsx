import { render } from '@testing-library/react';
import RootLayout from '../app/layout';
import * as nextHeaders from 'next/headers';
import { loadConfig } from '@/lib/config/loadConfig';

// Mock the headers API
jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

// Mock the loadConfig function
jest.mock('@/lib/config/loadConfig', () => ({
  loadConfig: jest.fn(),
}));

// Mock the ThemeProvider
jest.mock('@/components/ThemeProvider', () => {
  return {
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="theme-provider">{children}</div>
    ),
  };
});

// Mock the DirectoryDebug component
jest.mock('@/components/DirectoryDebug', () => {
  return {
    __esModule: true,
    default: () => <div data-testid="directory-debug">Debug Component</div>,
  };
});

describe('RootLayout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock implementation of headers
    (nextHeaders.headers as jest.Mock).mockReturnValue({
      get: jest.fn(),
    });
    
    // Default loadConfig to return a simple config
    (loadConfig as jest.Mock).mockReturnValue({
      theme: {
        colors: {
          primary: '#000000',
        },
      },
      seo: {
        title: 'Test Title',
        description: 'Test Description',
      },
    });
  });
  
  test('uses directory slug from headers', () => {
    // Setup the header mock to return a specific directory slug
    const mockGet = jest.fn().mockImplementation((key) => {
      if (key === 'x-directory-slug') return 'notary';
      return null;
    });
    (nextHeaders.headers as jest.Mock).mockReturnValue({
      get: mockGet,
    });
    
    // Render the layout
    render(<RootLayout>Test Children</RootLayout>);
    
    // Check that the loadConfig was called with the correct slug
    expect(loadConfig).toHaveBeenCalledWith('notary');
  });
  
  test('falls back to default slug if header not present', () => {
    // Setup the header mock to return null for the directory slug
    const mockGet = jest.fn().mockImplementation(() => null);
    (nextHeaders.headers as jest.Mock).mockReturnValue({
      get: mockGet,
    });
    
    // Render the layout
    render(<RootLayout>Test Children</RootLayout>);
    
    // Check that loadConfig was called with the default slug
    expect(loadConfig).toHaveBeenCalledWith('notary');
  });
  
  test('passes config to ThemeProvider', () => {
    // Setup header mock
    const mockGet = jest.fn().mockImplementation((key) => {
      if (key === 'x-directory-slug') return 'passport';
      return null;
    });
    (nextHeaders.headers as jest.Mock).mockReturnValue({
      get: mockGet,
    });
    
    // Set up a specific config to be returned
    const mockConfig = {
      theme: {
        colors: {
          primary: '#0000FF',
        },
      },
      seo: {
        title: 'Passport Help Now',
        description: 'Get help with your passport application',
      },
    };
    (loadConfig as jest.Mock).mockReturnValue(mockConfig);
    
    // Render the layout
    const { getByTestId } = render(<RootLayout>Test Children</RootLayout>);
    
    // Verify loadConfig was called with the correct slug
    expect(loadConfig).toHaveBeenCalledWith('passport');
    
    // Verify ThemeProvider was rendered
    expect(getByTestId('theme-provider')).toBeInTheDocument();
  });
});
