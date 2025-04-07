import fs from 'fs';
import path from 'path';
import { createClient } from '@/lib/supabase/server';
import { cache } from 'react';

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
 * This function prioritizes fetching data from Supabase as the source of truth
 * @param slug - The directory slug to load configuration for
 * @returns The directory configuration or default config if not found
 */
export const loadConfig = cache(async function(slug?: string): Promise<DirectoryConfig> {
  // If no slug is provided, return the default config
  if (!slug) {
    return defaultConfig;
  }

  try {
    // First attempt to get the directory config from Supabase (source of truth)
    const supabase = createClient();
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error(`Error fetching directory from Supabase for slug ${slug}:`, error);
    }
    
    // If we successfully retrieved the directory data from Supabase, convert it to a DirectoryConfig
    if (data) {
      console.log(`Found directory in Supabase for slug: ${slug}`);
      
      // Convert the Supabase directory data to DirectoryConfig format
      // This assumes certain fields are present in the Supabase data
      const config: DirectoryConfig = {
        name: data.name || defaultConfig.name,
        title: data.title || defaultConfig.title,
        description: data.description || defaultConfig.description,
        logo: {
          path: data.logo_path || defaultConfig.logo.path,
          alt: data.logo_alt || defaultConfig.logo.alt
        },
        theme: {
          name: data.theme_name || defaultConfig.theme.name,
          colors: {
            primary: data.brand_color_primary || defaultConfig.theme.colors.primary,
            secondary: data.brand_color_secondary || defaultConfig.theme.colors.secondary,
            accent: data.brand_color_accent || defaultConfig.theme.colors.accent
          }
        },
        hero: {
          heading: data.hero_heading || defaultConfig.hero.heading,
          subheading: data.hero_subheading || defaultConfig.hero.subheading
        },
        serviceTypes: data.service_types || defaultConfig.serviceTypes,
        navigation: data.navigation || defaultConfig.navigation,
        seo: {
          title: data.seo_title || defaultConfig.seo.title,
          description: data.seo_description || defaultConfig.seo.description
        },
        features: data.features || defaultConfig.features
      };
      
      return config;
    }
    
    // If Supabase lookup failed, log a warning
    console.warn(`Directory not found in Supabase for slug: ${slug}`);
    
    // For development only: Fall back to local config if absolutely necessary
    // In a production environment, this should return defaultConfig
    return defaultConfig;
  } catch (error) {
    console.error(`Error loading config for slug ${slug}:`, error);
    return defaultConfig;
  }
});