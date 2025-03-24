import { render, screen } from '@testing-library/react';
import DirectoryPage from '@/app/directory/[slug]/page';
import { useDirectoryWithFallback } from '@/lib/config/useDirectoryWithFallback';
import { loadConfig } from '@/lib/config/loadConfig';

// Mock the useDirectoryWithFallback hook
jest.mock('@/lib/config/useDirectoryWithFallback', () => ({
  useDirectoryWithFallback: jest.fn()
}));

// Mock the loadConfig function
jest.mock('@/lib/config/loadConfig', () => ({
  loadConfig: jest.fn()
}));

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href, className }: { children: React.ReactNode; href: string; className?: string }) => {
    return (
      <a href={href} className={className} data-testid={`link-to-${href}`}>
        {children}
      </a>
    );
  };
});

// Create a custom render function to wrap with client component wrappers if needed
function customRender(ui: React.ReactElement) {
  return render(ui);
}

describe('DirectoryPage', () => {
  const mockConfig = {
    name: 'notary',
    title: 'Notary Finder Now',
    description: 'Find qualified notaries in your area',
    hero: {
      heading: 'Find a Qualified Notary Near You — Now!',
      subheading: 'Connect with mobile, 24-hour, and free notary services in your area instantly.'
    },
    serviceTypes: [
      'Mobile Notaries',
      '24-Hour Availability',
      'Remote Notaries',
      'Free Services'
    ],
    theme: {
      name: 'blue-notary',
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#f97316'
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock loadConfig to return our mockConfig
    (loadConfig as jest.Mock).mockReturnValue(mockConfig);
    
    // Mock successful config loading
    (useDirectoryWithFallback as jest.Mock).mockReturnValue({
      config: mockConfig,
      loading: false,
      error: null,
      isFallback: false
    });
  });

  it('should render the hero section with correct content', () => {
    customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    
    // Check that the hero heading is rendered
    const headingElement = screen.getByRole('heading', { 
      name: 'Find a Qualified Notary Near You — Now!',
      level: 1
    });
    expect(headingElement).toBeInTheDocument();
    
    // Check that the hero subheading is rendered
    const subheadingText = 'Connect with mobile, 24-hour, and free notary services in your area instantly.';
    const subheadingElement = screen.getByText(subheadingText);
    expect(subheadingElement).toBeInTheDocument();
  });

  it('should render the search form', () => {
    customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    
    // Check for search form elements - using more specific selectors
    const searchButton = screen.getByRole('button', { name: /search/i });
    expect(searchButton).toBeInTheDocument();
  });

  it('should render service types correctly', () => {
    customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    
    // Check that service types section exists
    const serviceSectionHeading = screen.getByRole('heading', { name: /our services/i });
    expect(serviceSectionHeading).toBeInTheDocument();
    
    // Use getAllByText to get all instances of duplicated text
    const mobileNotaryInstances = screen.getAllByText('Mobile Notaries');
    expect(mobileNotaryInstances.length).toBeGreaterThanOrEqual(2); // At least in dropdown and as card
    
    const hourAvailabilityInstances = screen.getAllByText('24-Hour Availability');
    expect(hourAvailabilityInstances.length).toBeGreaterThanOrEqual(2);
    
    // Verify that the service type dropdown exists
    const dropdown = screen.getByLabelText(/service type/i);
    expect(dropdown).toBeInTheDocument();
  });

  it('should handle loading state', () => {
    // Mock loading state
    (useDirectoryWithFallback as jest.Mock).mockReturnValue({
      config: null,
      loading: true,
      error: null,
      isFallback: false
    });
    
    // In a real component, there would be a loading indicator
    // For now, we'll just verify no errors are thrown during render
    expect(() => {
      customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    }).not.toThrow();
  });

  it('should handle error state', () => {
    // Mock error state
    (useDirectoryWithFallback as jest.Mock).mockReturnValue({
      config: null,
      loading: false,
      error: new Error('Failed to load config'),
      isFallback: false
    });
    
    // In a real component, there would be an error message
    // For now, we'll just verify no errors are thrown during render
    expect(() => {
      customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    }).not.toThrow();
  });
});
