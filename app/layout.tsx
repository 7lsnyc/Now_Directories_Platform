import '../styles/globals.css';
import type { Metadata } from 'next';
import { loadConfig } from '@/lib/config/loadConfig';
import ThemeProvider from '@/components/ThemeProvider';
import { headers } from 'next/headers';
import DirectoryDebug from '@/components/DirectoryDebug';

export const metadata: Metadata = {
  title: 'Now Directories Platform',
  description: 'A platform for managing directories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get directory slug from the request headers set by middleware
  const headersList = headers();
  const directorySlug = headersList.get('x-directory-slug') || 'notary';
  
  // Load configuration for the current directory based on the slug
  const config = loadConfig(directorySlug);
  
  // Update metadata based on directory config
  metadata.title = config.seo?.title || 'Now Directories Platform';
  metadata.description = config.seo?.description || 'A platform for managing directories';
  
  return (
    <html lang="en">
      <body>
        <ThemeProvider config={config}>
          {children}
          <DirectoryDebug />
        </ThemeProvider>
      </body>
    </html>
  );
}
