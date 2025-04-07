'use client';

import { useEffect, useState } from 'react';

/**
 * A simple debug component to display the current directory slug
 * and configuration. Only shown in development mode.
 */
export default function DirectoryDebug() {
  const [slug, setSlug] = useState<string>('');
  const [host, setHost] = useState<string>('');
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    // This will only run on the client
    setIsMounted(true);
    
    // Get the slug from the custom header
    const fetchDebugInfo = async () => {
      try {
        const response = await fetch('/api/debug-directory');
        if (response.ok) {
          const data = await response.json();
          setSlug(data.directorySlug);
        }
      } catch (error) {
        console.error('Error fetching debug info:', error);
      }
    };
    
    fetchDebugInfo();
  }, []);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;
  
  // Don't render anything on the server or before mounting
  if (!isMounted) return null;
  
  // Now it's safe to access window because we know we're on the client
  const currentHost = window.location.host;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-sm z-50 max-w-xs">
      <h3 className="font-bold mb-1">Directory Debug</h3>
      <p><span className="opacity-70">Slug:</span> {slug || 'loading...'}</p>
      <p><span className="opacity-70">Host:</span> {currentHost}</p>
      <p className="mt-2 text-xs opacity-70">This debug panel only appears in development.</p>
    </div>
  );
}
