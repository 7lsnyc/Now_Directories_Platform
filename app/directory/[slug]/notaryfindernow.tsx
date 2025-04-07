'use client';

import React from 'react';
import NotaryListWrapper from '@/components/notary/NotaryListWrapper';
import { Directory } from '@/types/directory';

interface NotaryFinderNowProps {
  directory: Directory;
}

/**
 * NotaryFinderNow - specialized content for the Notary Finder Now directory
 * Implements geolocation-enhanced search functionality
 */
export default function NotaryFinderNow({ directory }: NotaryFinderNowProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Find a Notary Near You
        </h1>
        
        <p className="text-lg text-gray-700 mb-6">
          Use your current location or enter a city/zip code to find verified notaries in your area.
        </p>
        
        {/* Main search section with NotaryListWrapper */}
        <div className="my-8">
          <NotaryListWrapper />
        </div>
        
        {/* Additional information section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            About {directory.name}
          </h2>
          
          <p className="text-gray-700 mb-4">
            {directory.name} helps connect individuals and businesses with professional notaries 
            across the United States. Our directory features verified notaries with detailed 
            information about their services, ratings, and locations.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-theme-primary">
                For Notaries
              </h3>
              <p className="text-gray-700">
                Are you a notary looking to grow your business? Join our directory to connect with 
                clients in your area and showcase your services and expertise.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-theme-primary">
                For Clients
              </h3>
              <p className="text-gray-700">
                Finding a reliable notary has never been easier. Use our geolocation search to 
                find professionals near you, filter by service type, and read reviews from other clients.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
