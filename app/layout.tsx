import '../styles/globals.css';
import './env-config'; // Import this first to ensure environment variables are available
import type { Metadata } from 'next';
import { loadConfig } from '@/lib/config/loadConfig';
import ThemeProvider from '@/components/ThemeProvider';
import { headers } from 'next/headers';
import DirectoryDebug from '@/components/DirectoryDebug';
import ErrorBoundaryWrapper from '@/components/ErrorBoundaryWrapper';
import { SupabaseProvider } from '@/lib/supabase/provider';

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
  
  // Load configuration for the current directory based on the slug
  const config = await loadConfig(directorySlug);
  
  // Update metadata based on directory config
  metadata.title = config.seo?.title || 'Now Directories Platform';
  metadata.description = config.seo?.description || 'A platform for managing directories';
  
  return (
    <html lang="en">
      <body>
        <SupabaseProvider>
          <ThemeProvider 
            directory={directorySlug}
            themeColors={{
              primary: config.theme?.colors?.primary || '#0f766e',
              secondary: config.theme?.colors?.secondary || '#0369a1',
              accent: config.theme?.colors?.accent || '#4f46e5'
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
