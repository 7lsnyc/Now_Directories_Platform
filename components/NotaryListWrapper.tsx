'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the NotaryList component to reduce initial bundle size
const NotaryList = dynamic(() => import('./NotaryList'), {
  loading: () => <NotaryListPlaceholder />
});

// Placeholder component to show while NotaryList is loading
const NotaryListPlaceholder = () => (
  <div className="p-4 border border-gray-200 rounded-md">
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-12 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * NotaryListWrapper
 * Provides dynamic loading for the NotaryList component to reduce initial bundle size
 * This improves performance by only loading the component (and related environment variables)
 * when it's actually needed
 */
export default function NotaryListWrapper() {
  return (
    <Suspense fallback={<NotaryListPlaceholder />}>
      <NotaryList />
    </Suspense>
  );
}
