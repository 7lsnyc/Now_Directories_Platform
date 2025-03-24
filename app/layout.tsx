import '../styles/globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import ThemeProvider from '@/components/ThemeProvider';
import { loadConfig } from '@/lib/config/loadConfig';

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
          <div className="min-h-screen flex flex-col">
            <header className="bg-theme-primary text-white p-4">
              <div className="container mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">Now Directories</h1>
                <nav>
                  <ul className="flex space-x-6">
                    <li>
                      <Link href="/" className="hover:text-theme-accent transition-colors">Home</Link>
                    </li>
                    <li>
                      <Link href="/notaries" className="hover:text-theme-accent transition-colors">Notaries</Link>
                    </li>
                    <li>
                      <Link href="/directory/notary" className="hover:text-theme-accent transition-colors">Notary Directory</Link>
                    </li>
                  </ul>
                </nav>
              </div>
            </header>
            <main className="flex-grow">{children}</main>
            <footer className="bg-gray-100 py-6">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>&copy; {new Date().getFullYear()} Now Directories Platform. All rights reserved.</p>
              </div>
            </footer>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
