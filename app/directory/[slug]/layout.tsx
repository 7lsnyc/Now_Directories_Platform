// app/directory/[slug]/layout.tsx
import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { loadConfig } from '@/lib/config/loadConfig';
import ThemeProviderClient from '@/components/ThemeProviderClient';
import supabase from '@/lib/supabase';
import { DirectoryConfig } from '@/lib/config/loadConfig';

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
  // Attempt to fetch directory config from Supabase
  let directoryConfig: DirectoryConfig | null = null;
  
  try {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', params.slug)
      .single();
      
    if (error) {
      console.log(`Error fetching directory config from Supabase: ${error.message}`);
      // Will fallback to local JSON
    } else if (data) {
      // Convert Supabase data to DirectoryConfig format
      directoryConfig = {
        name: data.name || params.slug,
        title: data.title || 'Directory',
        description: data.description || '',
        theme: data.theme || {
          name: 'default',
          colors: {
            primary: '#1e40af',
            secondary: '#1e3a8a',
            accent: '#f97316'
          }
        },
        logo: data.logo || {
          path: '/images/logo.png',
          alt: 'Directory Logo'
        },
        navigation: data.navigation || {
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
        hero: data.hero || {
          heading: 'Welcome to Directory',
          subheading: 'Find what you need'
        },
        serviceTypes: data.serviceTypes || [],
        seo: data.seo || {
          title: data.title || 'Directory',
          description: data.description || 'Directory description'
        },
        features: data.features || {
          search: true,
          filter: true,
          sort: true,
          pagination: true
        }
      };
    }
  } catch (error) {
    console.error('Failed to fetch directory from Supabase:', error);
    // Will fallback to local JSON
  }
  
  // If Supabase didn't return data, fallback to local JSON config
  if (!directoryConfig) {
    try {
      console.log(`[DEBUG Layout] No Supabase data found for ${params.slug}, using loadConfig`);
      // Use await since loadConfig is now async
      directoryConfig = await loadConfig(params.slug);
      console.log(`[DEBUG Layout] Config loaded via loadConfig:`, {
        name: directoryConfig.name,
        title: directoryConfig.title
      });
    } catch (error) {
      console.error(`[DEBUG Layout] Error in loadConfig for ${params.slug}:`, error);
      notFound();
      return null;
    }
  }

  // If config is default (not found in Supabase or local files), return 404
  if (directoryConfig.name === 'default') {
    console.log(`[DEBUG Layout] Directory not found for ${params.slug}, returning 404`);
    notFound();
    // Return null for testing environments
    return null;
  }

  return (
    <ThemeProviderClient config={directoryConfig}>
      <div className="min-h-screen flex flex-col" data-testid="directory-layout">
        <header className="bg-theme-primary text-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href={`/directory/${params.slug}`} className="flex items-center space-x-2">
              {directoryConfig.logo?.path && (
                <Image 
                  src={directoryConfig.logo.path} 
                  alt={directoryConfig.logo.alt || directoryConfig.title} 
                  width={40} 
                  height={40}
                  className="w-10 h-10"
                />
              )}
              <span className="font-bold text-xl">{directoryConfig.title}</span>
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
                {directoryConfig.navigation?.header?.ctaButton && (
                  <li>
                    <Link 
                      href={directoryConfig.navigation.header.ctaButton.url} 
                      className="btn-theme-primary"
                    >
                      {directoryConfig.navigation.header.ctaButton.text}
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
                <p>{directoryConfig.description}</p>
              </div>
              
              {directoryConfig.navigation?.footer?.quickLinks?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    {directoryConfig.navigation.footer.quickLinks.map((link, index) => (
                      <li key={`quick-link-${index}`}>
                        <Link href={link.url} className="hover:underline">
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {directoryConfig.navigation?.footer?.services?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Services</h3>
                  <ul className="space-y-2">
                    {directoryConfig.navigation.footer.services.map((link, index) => (
                      <li key={`service-link-${index}`}>
                        <Link href={link.url} className="hover:underline">
                          {link.text}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {directoryConfig.navigation?.footer?.support?.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">Support</h3>
                  <ul className="space-y-2">
                    {directoryConfig.navigation.footer.support.map((link, index) => (
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
              <p>&copy; {new Date().getFullYear()} {directoryConfig.title}. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProviderClient>
  );
};

// Use a TypeScript cast to bypass the type checking on Next.js layouts
export default DirectoryLayout as unknown as React.ComponentType;
