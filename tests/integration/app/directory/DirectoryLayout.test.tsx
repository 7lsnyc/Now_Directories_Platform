import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { withNextLayoutProps } from '@/tests/helpers/nextjs-types';

// Import the actual layout component
const ActualDirectoryLayout = withNextLayoutProps(
  require('@/app/directory/[slug]/layout').default
);

// Mock the loadConfig function
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
        logo: {
          path: '/images/notary-logo.png',
          alt: 'Notary Directory Logo'
        },
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
              { text: 'Search', url: '/search' },
            ],
            services: [
              { text: 'Mobile Notary', url: '/services/mobile' },
              { text: 'In-Office Notary', url: '/services/office' },
            ],
            support: [
              { text: 'Contact', url: '/contact' },
              { text: 'FAQ', url: '/faq' },
            ]
          }
        },
        hero: {
          heading: 'Find Notaries Near You',
          subheading: 'Quick, reliable notary services in your area'
        },
        serviceTypes: ['Mobile Notary', 'In-Office Notary'],
        seo: {
          title: 'Notary Directory - Find Notaries Near You',
          description: 'Search for qualified notaries in your area'
        }
      };
    } else if (slug === 'passport') {
      return {
        name: 'passport',
        title: 'Passport Services',
        description: 'Find passport services near you',
        theme: {
          colors: {
            primary: '#0e7490',
            secondary: '#0c4a6e',
            accent: '#f59e0b'
          }
        },
        logo: {
          path: '/images/passport-logo.png',
          alt: 'Passport Services Logo'
        },
        navigation: {
          header: {
            ctaButton: {
              text: 'Apply Now',
              url: '/apply'
            }
          },
          footer: {
            quickLinks: [],
            services: [],
            support: []
          }
        },
        hero: {
          heading: 'Passport Services Near You',
          subheading: 'Fast, reliable passport processing'
        },
        serviceTypes: ['New Passport', 'Renewal', 'Expedited Service'],
        seo: {
          title: 'Passport Services Directory',
          description: 'Find passport services in your area'
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
      logo: {
        path: '/images/logo.png',
        alt: 'Directory Logo'
      },
      navigation: {
        header: {
          ctaButton: {
            text: 'Get Started',
            url: '#'
          }
        },
        footer: {
          quickLinks: [],
          services: [],
          support: []
        }
      },
      hero: {
        heading: 'Welcome to Directory',
        subheading: 'Find what you need'
      },
      serviceTypes: [],
      seo: {
        title: 'Directory',
        description: 'Directory description'
      }
    };
  })
}));

// Mock ThemeProviderClient component
jest.mock('@/components/ThemeProviderClient', () => {
  return {
    __esModule: true,
    default: ({ children, config }: { children: React.ReactNode; config: any }) => (
      <div data-testid="theme-provider" data-theme={config.name}>
        {children}
      </div>
    ),
  };
});

// Mock Next.js components
jest.mock('next/navigation', () => ({
  notFound: jest.fn(),
}));

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

// Mock supabase client
jest.mock('@/lib/supabase', () => ({
  __esModule: true,
  default: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnValue({
      data: null,
      error: null
    })
  }
}));

describe('DirectoryLayout', () => {
  it('renders the layout for a valid directory slug', async () => {
    const mockSlug = 'notary';
    
    render(
      <ActualDirectoryLayout params={{ slug: mockSlug }}>
        <div data-testid="child-element">Content</div>
      </ActualDirectoryLayout>
    );

    expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'notary');
    expect(screen.getByText('Notary Directory')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('passes the correct theme props for directory', async () => {
    render(
      <ActualDirectoryLayout params={{ slug: 'passport' }}>
        <div>Content</div>
      </ActualDirectoryLayout>
    );

    expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'passport');
    expect(screen.getByText('Passport Services')).toBeInTheDocument();
  });

  it('handles non-existent directory slugs', async () => {
    const { notFound } = require('next/navigation');
    
    render(
      <ActualDirectoryLayout params={{ slug: 'nonexistent' }}>
        <div>Content</div>
      </ActualDirectoryLayout>
    );

    expect(notFound).toHaveBeenCalled();
  });
});
