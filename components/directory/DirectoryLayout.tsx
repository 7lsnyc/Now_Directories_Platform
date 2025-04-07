"use client";

import React, { ReactNode } from 'react';
import ThemeProvider from '@/components/ThemeProvider';
import { Directory } from '@/types/directory';
import { useDirectory } from './DirectoryContext';
import DirectoryHeader from './DirectoryHeader';
import DirectoryFooter from './DirectoryFooter';

interface DirectoryLayoutProps {
  children: ReactNode;
  directory: Directory;
}

/**
 * Shared layout component for all directory sites
 * Implements consistent header and footer with directory-specific branding
 */
export default function DirectoryLayout({ children, directory }: DirectoryLayoutProps) {
  // Get directory theme colors
  const { themeColors } = useDirectory();
  
  return (
    <ThemeProvider 
      directory={directory.directory_slug}
      themeColors={themeColors}
    >
      <div className="flex flex-col min-h-screen">
        {/* Header component */}
        <DirectoryHeader directory={directory} />
        
        {/* Main content */}
        <main className="flex-grow container mx-auto px-4 py-6">
          {children}
        </main>
        
        {/* Footer component */}
        <DirectoryFooter directory={directory} />
      </div>
    </ThemeProvider>
  );
}
