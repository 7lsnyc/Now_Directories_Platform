import { renderHook } from '@testing-library/react';
import { useDirectoryWithFallback } from '@/lib/config/useDirectoryWithFallback';
import { useDirectoryConfig } from '@/lib/config/useDirectoryConfig';

// Mock the useDirectoryConfig hook
jest.mock('@/lib/config/useDirectoryConfig', () => ({
  useDirectoryConfig: jest.fn()
}));

describe('useDirectoryWithFallback', () => {
  // Prepare mock configurations
  const mockLoadedConfig = {
    name: 'notary',
    title: 'Notary Finder Now',
    description: 'Find notaries',
    logo: { path: '/logo.svg', alt: 'Notary Logo' },
    theme: {
      name: 'blue-notary',
      colors: { primary: '#1e40af', secondary: '#1e3a8a', accent: '#f97316' }
    },
    hero: {
      heading: 'Find Notaries',
      subheading: 'Quickly and easily'
    },
    serviceTypes: ['Mobile'],
    navigation: {
      header: { ctaButton: { text: 'Featured', url: '/featured' } },
      footer: {
        quickLinks: [{ text: 'Home', url: '/' }],
        services: [{ text: 'Services', url: '/services' }],
        support: [{ text: 'Help', url: '/help' }]
      }
    },
    seo: {
      title: 'Notary Finder Now',
      description: 'Find notaries easily'
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    }
  };

  it('should return the loaded config when available', () => {
    // Mock successful config loading
    (useDirectoryConfig as jest.Mock).mockReturnValue({
      config: mockLoadedConfig,
      loading: false,
      error: null
    });
    
    const { result } = renderHook(() => useDirectoryWithFallback('notary'));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isFallback).toBe(false);
    expect(result.current.config.name).toBe('notary');
    expect(result.current.config.theme.name).toBe('blue-notary');
  });

  it('should return fallback config when loading fails', () => {
    // Mock failed config loading
    (useDirectoryConfig as jest.Mock).mockReturnValue({
      config: null,
      loading: false,
      error: new Error('Failed to load config')
    });
    
    const { result } = renderHook(() => useDirectoryWithFallback('nonexistent'));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.isFallback).toBe(true);
    
    // Verify fallback values are used
    expect(result.current.config.name).toBe('default');
    expect(typeof result.current.config.title).toBe('string');
    expect(typeof result.current.config.hero.heading).toBe('string');
  });

  it('should properly merge configs', () => {
    // Mock partial config that's missing some properties
    const partialConfig = {
      name: 'partial',
      title: 'Partial Config',
      theme: {
        name: 'partial-theme'
      }
    };
    
    (useDirectoryConfig as jest.Mock).mockReturnValue({
      config: partialConfig,
      loading: false,
      error: null
    });
    
    const { result } = renderHook(() => useDirectoryWithFallback('partial'));
    
    expect(result.current.config.name).toBe('partial');
    expect(result.current.config.title).toBe('Partial Config');
    expect(result.current.config.theme.name).toBe('partial-theme');
    
    // These should come from fallback
    expect(typeof result.current.config.description).toBe('string');
    expect(Array.isArray(result.current.config.serviceTypes)).toBe(true);
    expect(typeof result.current.config.navigation.header.ctaButton.text).toBe('string');
  });
});
