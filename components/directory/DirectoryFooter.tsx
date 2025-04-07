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
            href="https://nowdirectories.com" 
            className="text-theme-accent hover:underline"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Visit Now Directories platform (opens in new tab)"
          >
            Now Directories
          </a>
        </p>
      </div>
    </footer>
  );
}
