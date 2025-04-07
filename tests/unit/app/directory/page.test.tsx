import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { withNextPageProps } from '@/tests/helpers/nextjs-types';

// Import the page component with the correct type wrapper
const DirectoryPage = withNextPageProps(
  require('@/app/directory/[slug]/page').default
);

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

// Custom render function to provide any necessary context
const customRender = (ui: React.ReactElement) => {
  return render(ui);
};

describe('DirectoryPage', () => {
  it('should render hero section with correct content', () => {
    customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    
    // Check hero content
    expect(screen.getByText('Find Notaries Near You')).toBeInTheDocument();
    expect(screen.getByText('Quick, reliable notary services in your area')).toBeInTheDocument();
  });
  
  it('should render search form with location and service type inputs', () => {
    customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    
    // Check search form elements
    expect(screen.getByLabelText('Location')).toBeInTheDocument();
    expect(screen.getByLabelText('Service Type')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });
  
  it('should display service types from the directory config', () => {
    customRender(<DirectoryPage params={{ slug: 'notary' }} />);
    
    // Check that service types are rendered
    expect(screen.getByText('Mobile Notary')).toBeInTheDocument();
    expect(screen.getByText('In-Office Notary')).toBeInTheDocument();
  });
  
  describe('CTA Section', () => {
    it('should render the CTA section with configured button text', () => {
      customRender(<DirectoryPage params={{ slug: 'notary' }} />);
      
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
        }
      });
      
      customRender(<DirectoryPage params={{ slug: 'notary' }} />);
      
      // Check that fallback text is used
      expect(screen.getByText('Request Featured Listing')).toBeInTheDocument();
    });
  });
});
