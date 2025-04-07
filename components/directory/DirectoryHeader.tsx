"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Directory } from '@/types/directory';

/**
 * Directory-specific header component
 * Shows branding and navigation for a specific directory
 */
export default function DirectoryHeader({ directory }: { directory: Directory }) {
  return (
    <header className="bg-theme-primary text-white p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {/* Directory Logo */}
          {directory.logo_url ? (
            <div className="relative h-10 w-40">
              <Image
                src={directory.logo_url}
                alt={`${directory.name} logo`}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <h1 className="text-xl font-bold">{directory.name}</h1>
          )}
        </div>
        
        {/* Nav links */}
        <nav className="hidden md:flex space-x-4" aria-label="Main Navigation">
          <Link 
            href="/" 
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Go to home page"
          >
            Home
          </Link>
          <Link 
            href="/search" 
            className="text-white hover:text-white/80 transition-colors"
            aria-label="Go to search page"
          >
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
