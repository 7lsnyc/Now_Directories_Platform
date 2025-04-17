'use client';

import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useDirectory } from '@/contexts/directory/DirectoryContext';
import { SearchFilters } from './NotarySearchForm';

/**
 * Dynamically import the NotaryList component to reduce initial bundle size
 * This improves performance by only loading the component when needed
 */
const NotaryList = dynamic(() => import('./NotaryList'), {
  loading: () => <NotaryListPlaceholder />
});

/**
 * Loading placeholder shown while the main NotaryList component is being loaded
 * Provides a skeleton UI with animation to indicate loading state
 * Matches the general structure of the actual NotaryList for smoother transitions
 * @returns {JSX.Element} Animated placeholder component
 */
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

/**
 * Props for the NotaryListWrapper component
 */
interface NotaryListWrapperProps {
  /** The directory slug - used to ensure directory context matches the current route */
  slug: string; 
}

/**
 * Wrapper component for the NotaryList that handles:
 * 1. Dynamic loading of the heavyweight NotaryList component
 * 2. Client-side only rendering to prevent hydration errors
 * 3. Directory context integration and validation
 * 4. Placeholder rendering during loading
 * 
 * This component is used in the directory/[slug]/page.tsx to display
 * notary listings for the specific directory. It works alongside the
 * DirectoryContext to ensure proper tenant-specific data is provided.
 * 
 * @param {NotaryListWrapperProps} props - Component props
 * @param {string} props.slug - The directory slug from the URL
 * @returns {JSX.Element} The wrapped NotaryList component with proper loading states
 */
export default function NotaryListWrapper({ slug }: NotaryListWrapperProps) {
  // State to ensure client-side rendering only
  const [isClient, setIsClient] = useState(false);
  
  // Create state for search parameters
  const [searchParams, setSearchParams] = useState<{
    coordinates: { latitude: number; longitude: number };
    filters: SearchFilters;
  } | null>(null);
  
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
  
  // Handle search submission
  const handleSearch = (coordinates: { latitude: number; longitude: number }, filters: SearchFilters) => {
    setSearchParams({ coordinates, filters });
  };
  
  // Use suspense to handle the loading state
  // Only render the full component on the client side to avoid hydration errors
  return (
    <Suspense fallback={<NotaryListPlaceholder />}>
      {isClient ? (
        <NotaryList 
          slug={slug} 
          directoryData={directory} 
          themeColors={themeColors}
          searchParams={searchParams}
        />
      ) : (
        <NotaryListPlaceholder />
      )}
    </Suspense>
  );
}
