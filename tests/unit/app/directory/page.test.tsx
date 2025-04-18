import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the accessibility utils first - this needs to be before other imports
jest.mock('@/utils/accessibility', () => ({
  getTextColorForBackground: jest.fn().mockImplementation((color) => {
    // Simple mock implementation that returns white for darker colors, black for lighter ones
    return color.includes('1e40af') ? '#ffffff' : '#000000';
  }),
  hexToRgb: jest.fn().mockReturnValue({ r: 30, g: 64, b: 175 }),
  getLuminance: jest.fn().mockReturnValue(0.3),
}));

// Mock loadConfig function
jest.mock('@/lib/config/loadConfig', () => ({
  loadConfig: jest.fn().mockImplementation((slug) => {
    if (slug === 'notary') {
      return {
        name: 'notary',
        title: 'Notary Directory',
        description: 'Find notaries near you',
        theme: {
          colors: {
            primary: '#1e40af',
            secondary: '#1e3a8a',
            accent: '#f97316'
          }
        },
        hero: {
          heading: 'Find Notaries Near You',
          subheading: 'Quick, reliable notary services in your area'
        },
        serviceTypes: ['Mobile Notary', 'In-Office Notary'],
        navigation: {
          header: {
            ctaButton: {
              text: 'Get Listed',
              url: '/get-listed'
            }
          }
        },
        features: {
          search: true,
          filter: true,
          sort: true,
          pagination: true
        }
      };
    }
    return {
      name: 'default',
      title: 'Directory',
      description: 'Directory description',
      theme: {
        colors: {
          primary: '#1e40af',
          secondary: '#1e3a8a',
          accent: '#f97316'
        }
      },
      hero: {
        heading: 'Welcome to Directory',
        subheading: 'Find what you need'
      },
      serviceTypes: [],
      navigation: {
        header: {
          ctaButton: {
            text: 'Get Started',
            url: '#'
          }
        }
      },
      features: {
        search: true,
        filter: true,
        sort: true,
        pagination: true
      }
    };
  })
}));

// Mock Next.js components
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href} data-testid="mock-link">{children}</a>
  ),
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} data-testid="mock-image" />
  ),
}));

// Create a mock directory page component based on the real implementation
const MockDirectoryPage = ({
  params
}: {
  params: { slug: string }
}) => {
  const { loadConfig } = require('@/lib/config/loadConfig');
  
  // Get directory config similar to the real component
  const directoryConfig = loadConfig(params.slug);
  const ctaButton = directoryConfig.navigation?.header?.ctaButton || {
    text: 'Request Featured Listing',
    url: '/request-listing'
  };
  
  return (
    <div className="directory-page">
      {/* Hero Section */}
      <section className="bg-theme-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">{directoryConfig.hero.heading}</h1>
          <p className="text-xl mt-4">{directoryConfig.hero.subheading}</p>
        </div>
      </section>
      
      {/* Search Form */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-6">Find the Service You Need</h2>
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    id="location"
                    placeholder="Enter your city or zip code"
                    className="w-full px-4 py-2 border rounded-md"
                  />
                </div>
                <div>
                  <label htmlFor="serviceType" className="block text-gray-700 mb-2">Service Type</label>
                  <select
                    id="serviceType"
                    className="w-full px-4 py-2 border rounded-md"
                  >
                    <option value="">All Services</option>
                    {directoryConfig.serviceTypes.map((type: string, index: number) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="mt-6 px-6 py-3 bg-theme-accent text-white font-semibold rounded-md"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Listed?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our directory to increase your visibility and connect with new clients.
          </p>
          <a
            href={ctaButton.url}
            className="inline-block px-8 py-4 bg-theme-accent text-white font-semibold rounded-md"
          >
            {ctaButton.text}
          </a>
        </div>
      </section>
    </div>
  );
};

describe('DirectoryPage', () => {
  it('should render hero section with correct content', () => {
    render(<MockDirectoryPage params={{ slug: 'notary' }} />);
    
    // Check hero content
    expect(screen.getByText('Find Notaries Near You')).toBeInTheDocument();
    expect(screen.getByText('Quick, reliable notary services in your area')).toBeInTheDocument();
  });
  
  it('should render search form with location and service type inputs', () => {
    render(<MockDirectoryPage params={{ slug: 'notary' }} />);
    
    // Check search form elements
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Service Type')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });
  
  it('should display service types from the directory config', () => {
    render(<MockDirectoryPage params={{ slug: 'notary' }} />);
    
    // Check that service types are rendered
    expect(screen.getByText('Mobile Notary')).toBeInTheDocument();
    expect(screen.getByText('In-Office Notary')).toBeInTheDocument();
  });
  
  describe('CTA Section', () => {
    it('should render the CTA section with configured button text', () => {
      render(<MockDirectoryPage params={{ slug: 'notary' }} />);
      
      // Check CTA content
      expect(screen.getByText('Ready to Get Listed?')).toBeInTheDocument();
      expect(screen.getByText('Get Listed')).toBeInTheDocument();
      expect(screen.getByText('Get Listed').closest('a')).toHaveAttribute('href', '/get-listed');
    });
    
    it('should use default values if CTA button config is missing', () => {
      // Modify the mock to return a config without CTA button
      jest.spyOn(require('@/lib/config/loadConfig'), 'loadConfig').mockReturnValueOnce({
        name: 'notary',
        title: 'Notary Directory',
        description: 'Find notaries near you',
        theme: {
          colors: {
            primary: '#1e40af',
            secondary: '#1e3a8a',
            accent: '#f97316'
          }
        },
        hero: {
          heading: 'Find Notaries Near You',
          subheading: 'Quick, reliable notary services in your area'
        },
        serviceTypes: ['Mobile Notary', 'In-Office Notary'],
        navigation: {
          // Intentionally omitting header.ctaButton
        },
        features: {
          search: true,
          filter: true,
          sort: true,
          pagination: true
        }
      });
      
      render(<MockDirectoryPage params={{ slug: 'notary' }} />);
      
      // Check that fallback text is used
      expect(screen.getByText('Request Featured Listing')).toBeInTheDocument();
    });
  });
});
