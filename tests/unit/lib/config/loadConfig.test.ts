import { loadConfig, defaultConfig } from '@/lib/config/loadConfig';
import { createServerClient } from '@/lib/supabase/server';

// Mock the Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn()
}));

describe('loadConfig', () => {
  // Mock directory data for testing
  const mockDirectoryData = {
    directory_slug: 'notary',
    name: 'notary',
    title: 'Notary Finder Now',
    description: 'Find qualified notaries in your area',
    logo_path: '/logos/notary-logo.svg',
    logo_alt: 'Notary Finder Now',
    theme_name: 'blue-notary',
    brand_color_primary: '#1e40af',
    brand_color_secondary: '#1e3a8a',
    brand_color_accent: '#f97316',
    hero_heading: 'Find a Qualified Notary Near You',
    hero_subheading: 'Connect with mobile notary services',
    service_types: ['Mobile Notary', '24-Hour Notary'],
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
    seo_title: 'Notary Finder Now - Find Notaries Near You',
    seo_description: 'Connect with mobile notary services in your area',
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    },
    is_active: true
  };

  // Mock Supabase select response
  const mockSupabaseSelect = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockReturnValue({
          data: mockDirectoryData,
          error: null
        })
      })
    })
  });

  // Mock Supabase client
  const mockSupabaseClient = {
    from: jest.fn().mockReturnValue({
      select: mockSupabaseSelect
    })
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Set up the mock Supabase client
    (createServerClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  it('should return the default config when no slug is provided', async () => {
    const config = await loadConfig();
    expect(config).toEqual(defaultConfig);
    expect(mockSupabaseClient.from).not.toHaveBeenCalled();
  });

  it('should load config from Supabase for valid slug', async () => {
    const config = await loadConfig('notary');
    
    // Verify Supabase was called correctly
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('directories');
    expect(mockSupabaseSelect).toHaveBeenCalledWith('*');
    
    // Verify the config contains the expected values
    expect(config.name).toBe('notary');
    expect(config.title).toBe('Notary Finder Now');
    expect(config.theme.name).toBe('blue-notary');
    expect(config.theme.colors.primary).toBe('#1e40af');
  });

  it('should return default config when directory not found in Supabase', async () => {
    // Mock a Supabase response with no data
    const noDataSupabaseSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockReturnValue({
            data: null,
            error: { message: 'No rows matched the query' }
          })
        })
      })
    });
    
    (mockSupabaseClient.from as jest.Mock).mockReturnValue({
      select: noDataSupabaseSelect
    });
    
    const config = await loadConfig('nonexistent');
    
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('directories');
    expect(config).toEqual(defaultConfig);
  });

  it('should return default config on error', async () => {
    // Mock a Supabase error
    const errorSupabaseSelect = jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockImplementation(() => {
            throw new Error('Supabase connection error');
          })
        })
      })
    });
    
    (mockSupabaseClient.from as jest.Mock).mockReturnValue({
      select: errorSupabaseSelect
    });
    
    const config = await loadConfig('notary');
    
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('directories');
    expect(config).toEqual(defaultConfig);
  });
});
