import '../styles/globals.css';
import type { Metadata } from 'next';
import { loadConfig } from '@/lib/config/loadConfig';
import ThemeProvider from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Now Directories Platform',
  description: 'A platform for managing directories',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Load default notary config for the main site
  const config = loadConfig('notary');
  
  return (
    <html lang="en">
      <body>
        <ThemeProvider config={config}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
