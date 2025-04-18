'use client';

import React, { useEffect, useState } from 'react';
import { useSupabase } from '@/lib/supabase/clientProvider';
import SearchArea from '@/components/directory/SearchArea';
import type { Directory } from '@/types/directory';

/**
 * Notaries Directory Page
 * Shows a list of all available notaries with search and filtering options
 * Uses the component registry pattern to render the appropriate components
 */
export default function NotariesPage() {
  const [directoryData, setDirectoryData] = useState<Directory | null>(null);
  const [loading, setLoading] = useState(true);
  const { supabase } = useSupabase();
  
  // Load the notary directory data
  useEffect(() => {
    const fetchDirectory = async () => {
      if (!supabase) {
        console.error('Supabase client not available');
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('directories')
          .select('*')
          .eq('directory_slug', 'notaryfindernow')
          .single();
          
        if (error) {
          console.error('Error fetching notary directory:', error);
        } else {
          console.log('Loaded notary directory data:', data);
          setDirectoryData(data);
        }
      } catch (error) {
        console.error('Failed to load directory data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDirectory();
  }, [supabase]);

  // Basic theme colors for the notary directory
  const themeColors = {
    primary: '#1e40af',
    secondary: '#1e3a8a',
    accent: '#f97316',
    primaryText: '#ffffff',
    secondaryText: '#ffffff',
    accentText: '#ffffff',
    background: '#f8fafc'
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-10 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Available Notaries</h1>
      <SearchArea 
        slug="notaryfindernow"
        directoryData={directoryData}
        themeColors={themeColors}
      />
    </div>
  );
}
