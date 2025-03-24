import { render, screen } from '@testing-library/react';
import DirectoryLayout from '@/app/directory/[slug]/layout';
import { loadConfig } from '@/lib/config/loadConfig';
import { notFound } from 'next/navigation';

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

// Mock the loadConfig function
jest.mock('@/lib/config/loadConfig', () => ({
  loadConfig: jest.fn(),
}));

// Mock image component since we don't need to test actual image loading
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

describe('DirectoryLayout', () => {
  const mockChild = <div data-testid="child-component">Child component</div>;
  const mockSlug = 'notary';
  
  const mockConfig = {
    name: 'notary',
    title: 'Notary Directory',
    description: 'Find qualified notaries',
    theme: {
      name: 'blue-notary',
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#f97316'
      }
    },
    hero: {
      heading: 'Find a Qualified Notary',
      subheading: 'Professional notary services'
    },
    serviceTypes: [],
    navigation: {
      header: {
        ctaButton: {
          text: 'Get Listed',
          url: '/get-listed'
        }
      },
      footer: {
        quickLinks: [
          { text: 'Home', url: '/' },
          { text: 'About', url: '/about' }
        ],
        services: [
          { text: 'Mobile Notary', url: '/services/mobile' }
        ],
        support: [
          { text: 'FAQ', url: '/faq' }
        ]
      }
    },
    logo: {
      path: '/images/notary-logo.svg',
      alt: 'Notary Directory Logo'
    },
    seo: {
      title: 'Find Notaries | Notary Directory',
      description: 'Find qualified notaries in your area'
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    }
  };

  // Mock default config for testing not found case
  const mockDefaultConfig = {
    ...mockConfig,
    name: 'default'
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    (loadConfig as jest.Mock).mockReturnValue(mockConfig);
  });
  
  it('should render the directory layout with theme provider', () => {
    render(
      <DirectoryLayout params={{ slug: mockSlug }}>
        {mockChild}
      </DirectoryLayout>
    );
    
    // Check that the theme provider has applied the directory layout
    expect(screen.getByTestId('directory-layout')).toBeInTheDocument();
    
    // Check that the logo and header are rendered (use getByAltText instead of getByText)
    expect(screen.getByAltText('Notary Directory Logo')).toBeInTheDocument();
    
    // Check that the child component is rendered
    expect(screen.getByTestId('child-component')).toBeInTheDocument();
    
    // Check that the theme provider is applied with the right theme
    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveClass('theme-notary');
    expect(themeProvider).toHaveStyle('--color-primary: #1e40af');
    expect(themeProvider).toHaveStyle('--color-secondary: #1e3a8a');
    expect(themeProvider).toHaveStyle('--color-accent: #f97316');
  });
  
  it('should apply the correct theme based on directory slug', () => {
    const passportConfig = {
      ...mockConfig,
      name: 'passport',
      theme: {
        name: 'green-passport',
        colors: {
          primary: '#10803d',
          secondary: '#065f46',
          accent: '#ca8a04'
        }
      }
    };
    
    (loadConfig as jest.Mock).mockReturnValue(passportConfig);
    
    render(
      <DirectoryLayout params={{ slug: 'passport' }}>
        {mockChild}
      </DirectoryLayout>
    );
    
    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveClass('theme-passport');
    expect(themeProvider).toHaveStyle('--color-primary: #10803d');
    expect(themeProvider).toHaveStyle('--color-secondary: #065f46');
    expect(themeProvider).toHaveStyle('--color-accent: #ca8a04');
  });
  
  it('should call notFound if the directory does not exist', () => {
    // Return a default config with name: 'default' instead of null
    // This matches how the layout component checks for not found
    (loadConfig as jest.Mock).mockReturnValue(mockDefaultConfig);
    
    render(
      <DirectoryLayout params={{ slug: 'nonexistent' }}>
        {mockChild}
      </DirectoryLayout>
    );
    
    expect(notFound).toHaveBeenCalled();
  });
});
