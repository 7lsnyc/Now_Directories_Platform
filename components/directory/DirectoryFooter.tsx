"use client";

import { Directory } from '@/types/directory';

/**
 * Directory-specific footer component
 * Shows copyright and attribution for a specific directory
 */
export default function DirectoryFooter({ directory }: { directory: Directory }) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 text-gray-700 p-4 mt-8" aria-label="Site Footer">
      <div className="container mx-auto text-center text-sm">
        <p>
          {currentYear} {directory.name}. Powered by{' '}
          <a 
            href="/" 
            className="text-theme-accent hover:underline"
            aria-label="Visit Now Directories platform home page"
          >
            Now Directories
          </a>
        </p>
      </div>
    </footer>
  );
}
