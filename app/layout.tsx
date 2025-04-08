import '../styles/globals.css';
import type { Metadata } from 'next';
import { createServerClient } from '@/lib/supabase/server';
import { SupabaseProvider } from '@/lib/supabase/client';
import ThemeProvider from '@/components/ThemeProvider';
import { headers } from 'next/headers';
import DirectoryDebug from '@/components/DirectoryDebug';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';

export const metadata: Metadata = {
  title: 'Now Directories Platform',
  description: 'A platform for managing directories',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get directory slug from the request headers set by middleware
  const headersList = headers();
  const directorySlug = headersList.get('x-directory-slug') || 'notary';
  
  // Create server-side Supabase client
  const supabase = createServerClient();
  
  // Load configuration for the current directory based on the slug directly from Supabase
  const { data: config, error } = await supabase
    .from('directories')
    .select('*')
    .eq('directory_slug', directorySlug)
    .eq('is_active', true)
    .single();
  
  if (error) {
    console.error(`Error loading directory config from Supabase: ${error.message}`);
  }
  
  // Use the data from Supabase or fallback to reasonable defaults
  const directoryConfig = config ? {
    name: config.name || 'Now Directories Platform',
    seo: { 
      title: config.seo_title || 'Now Directories Platform', 
      description: config.seo_description || 'A platform for managing directories'
    },
    theme: { 
      colors: { 
        primary: config.brand_color_primary || '#0f766e', 
        secondary: config.brand_color_secondary || '#0369a1',
        accent: config.brand_color_accent || '#4f46e5'
      }
    }
  } : {
    name: 'Now Directories Platform',
    seo: { 
      title: 'Now Directories Platform', 
      description: 'A platform for managing directories'
    },
    theme: { 
      colors: { 
        primary: '#0f766e', 
        secondary: '#0369a1',
        accent: '#4f46e5'
      }
    }
  };
  
  // Update metadata
  metadata.title = directoryConfig.seo.title;
  metadata.description = directoryConfig.seo.description;
  
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <ThemeProvider 
            directory={directorySlug}
            themeColors={{
              primary: directoryConfig.theme.colors.primary,
              secondary: directoryConfig.theme.colors.secondary,
              accent: directoryConfig.theme.colors.accent
            }}
          >
            <ErrorBoundaryWrapper>
              {children}
              <DirectoryDebug />
            </ErrorBoundaryWrapper>
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
