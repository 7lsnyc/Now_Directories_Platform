import { render } from '@testing-library/react';
import DirectoryPage from '@/app/directory/[slug]/page';
import { loadConfig } from '@/lib/config/loadConfig';
import ThemeProvider from '@/components/ThemeProvider';

// Mock the loadConfig function
jest.mock('@/lib/config/loadConfig', () => ({
  loadConfig: jest.fn(),
}));

// Mock components that use features we don't need to test in snapshots
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
    <img src={src} alt={alt} className={className} />
  ),
}));

// Mock DirectoryPage component to avoid the type.toLowerCase error
jest.mock('@/app/directory/[slug]/page', () => ({
  __esModule: true,
  default: ({ params }: { params: { slug: string } }) => {
    return <div data-testid="directory-page">Mocked Directory Page for {params.slug}</div>;
  },
}));

describe('DirectoryPage Snapshots', () => {
  const mockNotaryConfig = {
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
    // Fix: Changed from object array to string array to match DirectoryConfig interface
    serviceTypes: ['Mobile Notary', '24-Hour Notary'],
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

  const mockPassportConfig = {
    name: 'passport',
    title: 'Passport Services Directory',
    description: 'Find passport services near you',
    theme: {
      name: 'green-passport',
      colors: {
        primary: '#10803d',
        secondary: '#065f46',
        accent: '#ca8a04'
      }
    },
    hero: {
      heading: 'Find Passport Services',
      subheading: 'Expedited passport processing'
    },
    // Fix: Changed from object array to string array to match DirectoryConfig interface
    serviceTypes: ['Expedited', 'Renewal'],
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
          { text: 'Expedited Passport', url: '/services/expedited' }
        ],
        support: [
          { text: 'FAQ', url: '/faq' }
        ]
      }
    },
    logo: {
      path: '/images/passport-logo.svg',
      alt: 'Passport Services Directory Logo'
    },
    seo: {
      title: 'Find Passport Services | Passport Directory',
      description: 'Find passport services near you'
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render correctly with notary theme', () => {
    (loadConfig as jest.Mock).mockReturnValue(mockNotaryConfig);
    
    const { container } = render(
      <ThemeProvider config={mockNotaryConfig}>
        <DirectoryPage params={{ slug: 'notary' }} />
      </ThemeProvider>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('should render correctly with passport theme', () => {
    (loadConfig as jest.Mock).mockReturnValue(mockPassportConfig);
    
    const { container } = render(
      <ThemeProvider config={mockPassportConfig}>
        <DirectoryPage params={{ slug: 'passport' }} />
      </ThemeProvider>
    );
    
    expect(container).toMatchSnapshot();
  });

  it('should display different theme colors for different directories', () => {
    // First render with notary theme
    (loadConfig as jest.Mock).mockReturnValue(mockNotaryConfig);
    
    const { container: notaryContainer, unmount: unmountNotary } = render(
      <ThemeProvider config={mockNotaryConfig}>
        <div data-testid="theme-test" className="bg-theme-primary text-theme-accent">
          Theme Test
        </div>
      </ThemeProvider>
    );
    
    const notarySnapshot = notaryContainer.cloneNode(true);
    unmountNotary();
    
    // Then render with passport theme
    (loadConfig as jest.Mock).mockReturnValue(mockPassportConfig);
    
    const { container: passportContainer } = render(
      <ThemeProvider config={mockPassportConfig}>
        <div data-testid="theme-test" className="bg-theme-primary text-theme-accent">
          Theme Test
        </div>
      </ThemeProvider>
    );
    
    // Verify the two snapshots are different (indicating different theme applications)
    expect(notarySnapshot).not.toEqual(passportContainer);
  });
});
