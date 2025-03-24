import { render, screen } from '@testing-library/react';
import DirectoryLayout from '@/app/directory/[slug]/layout';
import { loadConfig } from '@/lib/config/loadConfig';
import { notFound } from 'next/navigation';

// Mock the loadConfig function
jest.mock('@/lib/config/loadConfig', () => ({
  loadConfig: jest.fn()
}));

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  notFound: jest.fn()
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

// Mock Next.js image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} data-testid="next-image" />
}));

describe('DirectoryLayout', () => {
  const mockConfig = {
    name: 'notary',
    title: 'Notary Finder Now',
    description: 'Find qualified notaries in your area',
    logo: {
      path: '/logos/notary-logo.svg',
      alt: 'Notary Finder Now'
    },
    theme: {
      name: 'blue-notary',
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#f97316'
      }
    },
    navigation: {
      header: {
        ctaButton: {
          text: 'Request Featured Listing',
          url: '/request-listing'
        }
      },
      footer: {
        quickLinks: [
          { text: 'Home', url: '/' },
          { text: 'Find a Notary', url: '/search' }
        ],
        services: [
          { text: 'Mobile Notaries', url: '/services/mobile' }
        ],
        support: [
          { text: 'FAQ', url: '/faq' }
        ]
      }
    }
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (loadConfig as jest.Mock).mockReturnValue(mockConfig);
  });

  it('should render the layout with the correct theme class', () => {
    const { container } = render(
      <DirectoryLayout params={{ slug: 'notary' }}>
        <div data-testid="child-content">Child Content</div>
      </DirectoryLayout>
    );
    
    // Check that the theme provider has the correct theme class
    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveClass('theme-notary');
    
    // Check that the theme provider has the correct CSS variables applied
    expect(themeProvider).toHaveStyle('--color-primary: #1e40af');
    expect(themeProvider).toHaveStyle('--color-secondary: #1e3a8a');
    expect(themeProvider).toHaveStyle('--color-accent: #f97316');
    
    // Find header link with specific text
    const headerLinks = container.querySelectorAll('header a');
    let foundHeaderTitle = false;
    headerLinks.forEach(link => {
      if (link.textContent && link.textContent.includes('Notary Finder Now')) {
        foundHeaderTitle = true;
      }
    });
    expect(foundHeaderTitle).toBe(true);
    
    // Check that the CTA button text is correct (more specific selector)
    const ctaLink = screen.getByText('Request Featured Listing');
    expect(ctaLink).toBeInTheDocument();
    
    // Check that the child content is rendered
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('should call notFound for non-existent directory', () => {
    const defaultConfig = {
      ...mockConfig,
      name: 'default'
    };
    
    (loadConfig as jest.Mock).mockReturnValue(defaultConfig);
    
    render(
      <DirectoryLayout params={{ slug: 'non-existent' }}>
        <div>Content</div>
      </DirectoryLayout>
    );
    
    expect(notFound).toHaveBeenCalled();
  });
});
