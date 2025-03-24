import fs from 'fs';
import path from 'path';
import { loadConfig } from '@/lib/config/loadConfig';

describe('loadConfig', () => {
  // Mock implementation for testing
  const mockConfig = {
    name: 'notary',
    title: 'Notary Finder Now',
    description: 'Find qualified notaries in your area offering mobile, 24-hour, and free services.',
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
    },
    seo: {
      title: 'Notary Finder Now - Find Qualified Mobile Notaries Near You',
      description: 'Connect with mobile, 24-hour, and free notary services in your area.'
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    }
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockConfig));
    (path.resolve as jest.Mock).mockReturnValue('config/notary.json');
  });

  it('should return the default config when no slug is provided', () => {
    const config = loadConfig();
    expect(config.name).toBe('default');
    expect(fs.readFileSync).not.toHaveBeenCalled();
  });

  it('should load config for valid slug', () => {
    const config = loadConfig('notary');
    
    expect(path.resolve).toHaveBeenCalledWith(expect.any(String), 'config', 'notary.json');
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalledWith('config/notary.json', 'utf8');
    
    expect(config.name).toBe('notary');
    expect(config.title).toBe('Notary Finder Now');
    expect(config.theme.name).toBe('blue-notary');
  });

  it('should return default config when slug file does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    
    const config = loadConfig('nonexistent');
    
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.readFileSync).not.toHaveBeenCalled();
    expect(config.name).toBe('default');
  });

  it('should return default config on error', () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('Simulated error');
    });
    
    const config = loadConfig('notary');
    
    expect(fs.existsSync).toHaveBeenCalled();
    expect(fs.readFileSync).toHaveBeenCalled();
    expect(config.name).toBe('default');
  });
});
