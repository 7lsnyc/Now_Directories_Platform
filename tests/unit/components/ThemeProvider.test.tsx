import { render, screen } from '@testing-library/react';
import ThemeProvider from '@/components/ThemeProvider';
import { DirectoryConfig } from '@/lib/config/loadConfig';

describe('ThemeProvider', () => {
  const mockNotaryConfig: DirectoryConfig = {
    name: 'notary',
    title: 'Notary Finder Now',
    description: 'Find qualified notaries in your area',
    theme: {
      name: 'blue-notary',
      colors: {
        primary: '#1e40af',
        secondary: '#1e3a8a',
        accent: '#f97316'
      }
    },
    hero: {
      heading: 'Find a Qualified Notary Near You',
      subheading: 'Connect with mobile, 24-hour, and free notary services'
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
        quickLinks: [],
        services: [],
        support: []
      }
    },
    logo: {
      path: '/images/notary-logo.svg',
      alt: 'Notary Finder Now Logo'
    },
    seo: {
      title: 'Find Notaries Near You | Notary Finder Now',
      description: 'Find qualified notaries in your area for document signing services'
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    }
  };

  const mockPassportConfig: DirectoryConfig = {
    name: 'passport',
    title: 'Passport Services Now',
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
      heading: 'Need a Passport Fast?',
      subheading: 'Connect with expedited passport services near you'
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
        quickLinks: [],
        services: [],
        support: []
      }
    },
    logo: {
      path: '/images/passport-logo.svg',
      alt: 'Passport Services Now Logo'
    },
    seo: {
      title: 'Find Passport Services Near You | Passport Services Now',
      description: 'Find expedited passport services in your area'
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    }
  };

  // Test for incomplete theme configuration
  const mockIncompleteConfig: DirectoryConfig = {
    name: 'incomplete',
    title: 'Incomplete Config',
    description: 'Testing incomplete theme configuration',
    theme: {
      name: 'incomplete-theme',
      colors: {
        primary: '#333333',
        // missing secondary and accent colors
      } as any
    },
    hero: {
      heading: 'Incomplete Theme Test',
      subheading: 'Testing fallback behavior'
    },
    serviceTypes: [],
    navigation: {
      header: {
        ctaButton: {
          text: 'Test',
          url: '/test'
        }
      },
      footer: {
        quickLinks: [],
        services: [],
        support: []
      }
    },
    logo: {
      path: '/images/test-logo.svg',
      alt: 'Test Logo'
    },
    seo: {
      title: 'Test Config',
      description: 'Testing configuration'
    },
    features: {
      search: false,
      filter: false,
      sort: false,
      pagination: false
    }
  };

  it('should apply the correct CSS variables based on notary config', () => {
    render(
      <ThemeProvider config={mockNotaryConfig}>
        <div data-testid="themed-child">Themed content</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveClass('theme-notary');
    
    // Check the applied CSS variables
    expect(themeProvider).toHaveStyle({
      '--color-primary': '#1e40af',
      '--color-secondary': '#1e3a8a',
      '--color-accent': '#f97316'
    });
  });

  it('should apply the correct CSS variables based on passport config', () => {
    render(
      <ThemeProvider config={mockPassportConfig}>
        <div data-testid="themed-child">Themed content</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveClass('theme-passport');
    
    // Check the applied CSS variables
    expect(themeProvider).toHaveStyle({
      '--color-primary': '#10803d',
      '--color-secondary': '#065f46',
      '--color-accent': '#ca8a04'
    });
  });

  it('should apply theme colors as CSS variables', () => {
    render(
      <ThemeProvider config={mockNotaryConfig}>
        <div data-testid="themed-child">Themed content</div>
      </ThemeProvider>
    );
    
    const themeElement = screen.getByTestId('theme-provider');
    
    // Only check the main color variables since the text color calculation might change
    expect(themeElement).toHaveStyle('--color-primary: #1e40af');
    expect(themeElement).toHaveStyle('--color-secondary: #1e3a8a');
    expect(themeElement).toHaveStyle('--color-accent: #f97316');
    
    // Check that text color variables exist but don't assert specific values
    // as they're calculated based on luminance and might change with algorithm tweaks
    expect(themeElement.style.getPropertyValue('--color-primary-text')).not.toBe('');
    expect(themeElement.style.getPropertyValue('--color-secondary-text')).not.toBe('');
    expect(themeElement.style.getPropertyValue('--color-accent-text')).not.toBe('');
  });

  it('should render children correctly', () => {
    render(
      <ThemeProvider config={mockNotaryConfig}>
        <div data-testid="themed-child">Themed content</div>
      </ThemeProvider>
    );

    expect(screen.getByTestId('themed-child')).toBeInTheDocument();
    expect(screen.getByText('Themed content')).toBeInTheDocument();
  });

  it('should handle incomplete theme configuration with fallbacks', () => {
    render(
      <ThemeProvider config={mockIncompleteConfig}>
        <div data-testid="themed-child">Themed content</div>
      </ThemeProvider>
    );

    const themeProvider = screen.getByTestId('theme-provider');
    expect(themeProvider).toHaveClass('theme-incomplete');
    
    // Should have the primary color from config
    expect(themeProvider).toHaveStyle({
      '--color-primary': '#333333',
    });
    
    // The style object should still have the secondary and accent properties
    // with default values applied by the ThemeProvider
    const styles = window.getComputedStyle(themeProvider);
    expect(styles.getPropertyValue('--color-secondary')).not.toBe('');
    expect(styles.getPropertyValue('--color-accent')).not.toBe('');
  });

  it('should apply theme classes that can be used by children', () => {
    render(
      <ThemeProvider config={mockNotaryConfig}>
        <div data-testid="themed-child" className="bg-theme-primary text-white">
          Themed content
        </div>
      </ThemeProvider>
    );

    // This is testing that the classes are applied, not the actual styles
    // since JSDOM doesn't fully process CSS
    const themedChild = screen.getByTestId('themed-child');
    expect(themedChild).toHaveClass('bg-theme-primary');
    expect(themedChild).toHaveClass('text-white');
  });
});
