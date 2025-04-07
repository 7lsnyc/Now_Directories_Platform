'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDirectory } from '@/contexts/directory/DirectoryContext';

// Dynamically import the NotaryList component to reduce initial bundle size
const NotaryList = dynamic(() => import('./NotaryList'), {
  loading: () => <NotaryListPlaceholder />
});

// Placeholder component to show while NotaryList is loading
const NotaryListPlaceholder = () => (
  <div className="p-4 border border-gray-200 rounded-md">
    <div className="animate-pulse space-y-4">
      {/* Search form placeholder */}
      <div className="p-4 bg-gray-100 rounded-md">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        <div className="flex space-x-4 mb-4">
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-full"></div>
      </div>
      
      {/* Results placeholder */}
      <div className="h-6 bg-gray-200 rounded w-1/2 mt-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="border border-gray-200 rounded-lg p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="flex space-x-2 mt-4">
              <div className="h-6 bg-gray-200 rounded w-20"></div>
              <div className="h-6 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface NotaryListWrapperProps {
  slug: string; 
}

/**
 * NotaryListWrapper
 * Provides dynamic loading for the NotaryList component with geolocation features
 * Improves performance by only loading the component when needed
 * 
 * Uses DirectoryContext to access directory-specific data
 */
export default function NotaryListWrapper({ slug }: NotaryListWrapperProps) {
  // State to ensure client-side rendering only
  const [isClient, setIsClient] = useState(false);
  
  // Access directory data from context
  const { directory, themeColors } = useDirectory();
  
  // Use effect to mark when component is mounted client-side
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  // Additional safety check - if the directory in context doesn't match the provided slug
  // This may happen in rare cases when navigating between directories quickly
  if (directory && directory.directory_slug !== slug) {
    console.warn(`[NotaryListWrapper] Slug mismatch: ${slug} vs ${directory.directory_slug}`);
  }
  
  // Use suspense to handle the loading state
  // Only render the full component on the client side to avoid hydration errors
  return (
    <Suspense fallback={<NotaryListPlaceholder />}>
      {isClient ? (
        <NotaryList 
          slug={slug} 
          directoryData={directory} 
          themeColors={themeColors}
        />
      ) : (
        <NotaryListPlaceholder />
      )}
    </Suspense>
  );
}
