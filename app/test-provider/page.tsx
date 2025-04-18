'use client';

import { useState, useEffect } from 'react';
import { ProviderSearchForm, ProviderList } from '@/components/provider';
import { getProviderConfigFromSlug } from '@/types/provider';

export default function TestProviderPage() {
  const [searchParams, setSearchParams] = useState(null);
  const directorySlug = 'notaryfindernow';
  
  useEffect(() => {
    try {
      // Attempt to get provider config and log
      const config = getProviderConfigFromSlug(directorySlug);
      console.log('Provider Config:', config);
    } catch (error) {
      console.error('Error getting provider config:', error);
    }
  }, [directorySlug]);
  
  const handleSearch = (coordinates: any, filters: any) => {
    console.log('Search triggered with:', { coordinates, filters });
    setSearchParams({ coordinates, filters });
  };
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Provider Component Test Page</h1>
      
      <div className="bg-gray-100 p-4 mb-4">
        <pre className="text-sm">
          Directory Slug: {directorySlug}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">ProviderSearchForm Test</h2>
        <div className="border border-gray-300 rounded p-4">
          <ProviderSearchForm
            directorySlug={directorySlug}
            onSearch={handleSearch}
            availableServices={['Mobile Notary', 'Online Notary']}
            isLoading={false}
            primaryColor="#3B82F6"
          />
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-bold mb-2">ProviderList Test</h2>
        <div className="border border-gray-300 rounded p-4">
          <ProviderList
            slug={directorySlug}
            directoryData={null}
            themeColors={{ 
              primary: '#3B82F6', 
              secondary: '#1D4ED8', 
              accent: '#DBEAFE' 
            }}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
