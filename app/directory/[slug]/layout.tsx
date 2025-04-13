// app/directory/[slug]/layout.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loadConfig } from '@/lib/config/loadConfig';
import ThemeProviderClient from '@/components/ThemeProviderClient';
import supabase from '@/lib/supabase';
import { DirectoryConfig } from '@/lib/config/loadConfig';
import { Directory } from '@/types/directory';
import { DirectoryProvider } from '@/contexts/directory/DirectoryContext';

/**
 * Layout component for the directory/[slug] route
 * Provides theme context and common layout elements
 * 
 * This is a Server Component that fetches directory config
 * from Supabase, with fallback to local JSON files
 */
const DirectoryLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) => {
  // Attempt to fetch directory data from Supabase
  let directoryData: Directory | null = null;
  
  try {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', params.slug)
      .single();
      
    if (error) {
      // Will fallback to local JSON
    } else if (data) {
      directoryData = data as Directory;
    }
  } catch (error) {
    // Will fallback to local JSON
  }
  
  // If Supabase didn't return data, fallback to local JSON config
  let directoryConfig: DirectoryConfig | null = null;
  
  if (!directoryData) {
    try {
      directoryConfig = await loadConfig(params.slug);
    } catch (error) {
      notFound();
      return null;
    }
  }

  // If using local config and config is default (not found), return 404
  if (directoryConfig && directoryConfig.name === 'default') {
    notFound();
    // Return null for testing environments
    return null;
  }
  
  // Use directoryData from Supabase as the source of truth if available
  // If we have no directory data and no config, return 404
  if (!directoryData && !directoryConfig) {
    notFound();
    return null;
  }
  
  // Create a fallback config to pass to ThemeProviderClient
  const safeConfig: DirectoryConfig = directoryConfig || {
    name: directoryData?.name || params.slug,
    title: directoryData?.name || params.slug,
    description: directoryData?.description || '',
    theme: {
      name: 'default',
      colors: {
        primary: directoryData?.brand_color_primary || '#1e40af',
        secondary: directoryData?.brand_color_secondary || '#1e3a8a',
        accent: directoryData?.brand_color_accent || '#f97316'
      }
    },
    logo: {
      path: directoryData?.logo_url || '/images/logo.png',
      alt: directoryData?.name || 'Directory Logo'
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
      heading: directoryData?.name || 'Welcome',
      subheading: directoryData?.description || 'Find what you need'
    },
    serviceTypes: [],
    seo: {
      title: directoryData?.name || params.slug,
      description: directoryData?.description || 'Directory description'
    },
    features: {
      search: true,
      filter: true,
      sort: true,
      pagination: true
    }
  };

  return (
    <DirectoryProvider initialDirectory={directoryData}>
      <ThemeProviderClient config={safeConfig}>
        <div className="min-h-screen flex flex-col" data-testid="directory-layout">
          <header className="bg-theme-primary text-white">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href={`/directory/${params.slug}`} className="flex items-center space-x-2">
                {safeConfig.logo?.path && (
                  <Image 
                    src={safeConfig.logo.path} 
                    alt={safeConfig.logo.alt || safeConfig.title} 
                    width={40} 
                    height={40}
                    className="w-10 h-10"
                  />
                )}
                <span className="font-bold text-xl">{directoryData?.name || safeConfig.title}</span>
              </Link>
              
              <nav>
                <ul className="flex space-x-6">
                  <li>
                    <Link href={`/directory/${params.slug}`} className="hover:text-gray-200">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href={`/directory/${params.slug}/search`} className="hover:text-gray-200">
                      Search
                    </Link>
                  </li>
                  {safeConfig.navigation?.header?.ctaButton && (
                    <li>
                      <Link 
                        href={safeConfig.navigation.header.ctaButton.url} 
                        className="btn-theme-primary"
                      >
                        {safeConfig.navigation.header.ctaButton.text}
                      </Link>
                    </li>
                  )}
                </ul>
              </nav>
            </div>
          </header>

          <main className="flex-grow">
            {children}
          </main>

          <footer className="bg-theme-secondary text-white py-8">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4">About</h3>
                  <p>{directoryData?.description || safeConfig.description}</p>
                </div>
                
                {safeConfig.navigation?.footer?.quickLinks && safeConfig.navigation.footer.quickLinks.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                      {safeConfig.navigation.footer.quickLinks.map((link, index) => (
                        <li key={`quick-link-${index}`}>
                          <Link href={link.url} className="hover:underline">
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {safeConfig.navigation?.footer?.services && safeConfig.navigation.footer.services.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Services</h3>
                    <ul className="space-y-2">
                      {safeConfig.navigation.footer.services.map((link, index) => (
                        <li key={`service-link-${index}`}>
                          <Link href={link.url} className="hover:underline">
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {safeConfig.navigation?.footer?.support && safeConfig.navigation.footer.support.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold mb-4">Support</h3>
                    <ul className="space-y-2">
                      {safeConfig.navigation.footer.support.map((link, index) => (
                        <li key={`support-link-${index}`}>
                          <Link href={link.url} className="hover:underline">
                            {link.text}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
                <p>&copy; {new Date().getFullYear()} {directoryData?.name || safeConfig.title}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </div>
      </ThemeProviderClient>
    </DirectoryProvider>
  );
};

// Export the component with proper typing for Next.js layout
export default DirectoryLayout;
