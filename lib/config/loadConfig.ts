import fs from 'fs';
import path from 'path';

export interface DirectoryConfig {
  name: string;
  title: string;
  description: string;
  logo: {
    path: string;
    alt: string;
  };
  theme: {
    name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  };
  hero: {
    heading: string;
    subheading: string;
  };
  serviceTypes: string[];
  navigation: {
    header: {
      ctaButton: {
        text: string;
        url: string;
      };
    };
    footer: {
      quickLinks: Array<{ text: string; url: string }>;
      services: Array<{ text: string; url: string }>;
      support: Array<{ text: string; url: string }>;
    };
  };
  seo: {
    title: string;
    description: string;
  };
  features: {
    search: boolean;
    filter: boolean;
    sort: boolean;
    pagination: boolean;
  };
}

/**
 * Default configuration used as fallback when a directory config is not found
 */
export const defaultConfig: DirectoryConfig = {
  name: 'default',
  title: 'Directory Services',
  description: 'Find local services in your area.',
  logo: {
    path: '/logos/default-logo.svg',
    alt: 'Directory Services'
  },
  theme: {
    name: 'default-theme',
    colors: {
      primary: '#3b82f6',
      secondary: '#2563eb',
      accent: '#f59e0b'
    }
  },
  hero: {
    heading: 'Find Local Services',
    subheading: 'Discover trusted providers in your area.'
  },
  serviceTypes: [
    'Service Type 1',
    'Service Type 2',
    'Service Type 3',
    'Service Type 4'
  ],
  navigation: {
    header: {
      ctaButton: {
        text: 'Add Listing',
        url: '/add-listing'
      }
    },
    footer: {
      quickLinks: [
        { text: 'Home', url: '/' },
        { text: 'Search', url: '/search' },
        { text: 'About', url: '/about' },
        { text: 'Contact', url: '/contact' }
      ],
      services: [
        { text: 'Service 1', url: '/services/1' },
        { text: 'Service 2', url: '/services/2' },
        { text: 'Service 3', url: '/services/3' },
        { text: 'Service 4', url: '/services/4' }
      ],
      support: [
        { text: 'FAQ', url: '/faq' },
        { text: 'Privacy', url: '/privacy' },
        { text: 'Terms', url: '/terms' },
        { text: 'Add Listing', url: '/add-listing' }
      ]
    }
  },
  seo: {
    title: 'Directory Services - Find Local Providers',
    description: 'Find local service providers in your area. Trusted professionals available when you need them.'
  },
  features: {
    search: true,
    filter: true,
    sort: true,
    pagination: true
  }
};

/**
 * Loads configuration for a specific directory by slug
 * @param slug - The directory slug to load configuration for
 * @returns The directory configuration or default config if not found
 */
export function loadConfig(slug?: string): DirectoryConfig {
  // If no slug is provided, return the default config
  if (!slug) {
    return defaultConfig;
  }

  try {
    // Attempt to load the config file for the specified slug
    const configPath = path.resolve(process.cwd(), 'config', `${slug}.json`);
    
    // Check if the file exists
    if (!fs.existsSync(configPath)) {
      console.warn(`Config file not found for slug: ${slug}`);
      return defaultConfig;
    }
    
    // Read and parse the config file
    const configData = fs.readFileSync(configPath, 'utf8');
    const config = JSON.parse(configData) as DirectoryConfig;
    
    return config;
  } catch (error) {
    console.error(`Error loading config for slug ${slug}:`, error);
    return defaultConfig;
  }
}