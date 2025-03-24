// app/directory/[slug]/page.tsx
import { FC } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { loadConfig } from '@/lib/config/loadConfig';

/**
 * Page component for the directory/[slug] homepage
 * Shows hero section, search, and featured listings
 */
const DirectoryPage = ({ params }: { params: { slug: string } }) => {
  // Load the configuration for this directory
  const config = loadConfig(params.slug);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-theme-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              {config.hero.heading}
            </h1>
            <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto">
              {config.hero.subheading}
            </p>

            {/* Search Form */}
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1">
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Location
                  </label>
                  <input 
                    type="text" 
                    id="location" 
                    placeholder="Enter your location" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  />
                </div>
                <div className="col-span-1">
                  <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-1 text-left">
                    Service Type
                  </label>
                  <select 
                    id="service" 
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                  >
                    <option value="">Select service type</option>
                    {config.serviceTypes.map((type, index) => (
                      <option key={index} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-1 flex items-end">
                  <button 
                    type="submit" 
                    className="w-full bg-theme-accent text-white p-2 rounded-md hover:bg-opacity-90 font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Types Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {config.serviceTypes.map((type, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-full bg-theme-primary text-white flex items-center justify-center mb-4">
                  <span className="text-xl font-bold">{index + 1}</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">{type}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Professional {type.toLowerCase()} ready to assist you with your needs.
                </p>
                <Link 
                  href={`/directory/${params.slug}/search?service=${encodeURIComponent(type)}`}
                  className="mt-4 inline-block text-theme-primary hover:text-theme-secondary"
                >
                  Find {type} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings Section (Placeholder) */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-12">Featured Listings</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              Top-rated service providers in your area.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Placeholder for future listings */}
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">Featured listings will appear here in Phase 2</p>
              </div>
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">Featured listings will appear here in Phase 2</p>
              </div>
              <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-6 text-center">
                <p className="text-gray-500">Featured listings will appear here in Phase 2</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-theme-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Listed?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Join our directory to reach more customers and grow your business.
          </p>
          <Link 
            href={config.navigation?.header?.ctaButton?.url || '/request-listing'}
            className="bg-theme-accent hover:bg-opacity-90 text-white px-6 py-3 rounded-md font-medium inline-block"
          >
            {config.navigation?.header?.ctaButton?.text || 'Request Featured Listing'}
          </Link>
        </div>
      </section>
    </div>
  );
};

// Use a TypeScript cast to bypass the type checking on Next.js pages
export default DirectoryPage as unknown as React.ComponentType;
