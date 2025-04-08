// app/directory/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { Directory } from '@/types/directory';
import { getSearchFormComponent, getListWrapperComponent } from '@/lib/registry';
import { getTextColorForBackground } from '@/utils/accessibility';
import { FaMapMarkerAlt, FaSearch, FaMobileAlt, FaClock, FaStar, FaCheckCircle } from 'react-icons/fa';
import SearchComponentWrapper from '@/components/directory/SearchComponentWrapper';

// Generic skeleton component for loading state
function DirectoryPageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="h-10 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-6 animate-pulse"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="col-span-full bg-gray-50 p-6 rounded-lg border border-gray-200">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="bg-gray-50 p-6 rounded-lg border border-gray-200 flex flex-col"
            >
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6 mb-4 animate-pulse"></div>
              <div className="mt-auto">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Default generic directory content
function GenericDirectoryContent({ directory }: { directory: Directory }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold mb-4">{directory.name || 'Directory'}</h1>
        <p className="text-gray-600 mb-8">{directory.description || 'Browse our directory listings'}</p>
        
        {/* Generic directory content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="col-span-full bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h2 className="text-xl font-semibold mb-2">Search {directory.name}</h2>
            <p className="text-gray-600 mb-4">Use our search to find what you're looking for</p>
            {/* Search form component will go here in the future */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <p className="text-gray-500 text-center">This directory doesn't have a custom search form yet.</p>
            </div>
          </div>
          
          {/* Placeholder items */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div 
              key={i}
              className="bg-white p-6 rounded-lg shadow-md flex flex-col"
            >
              <h3 className="text-lg font-semibold mb-2">Directory Item {i + 1}</h3>
              <p className="text-gray-600 mb-4">This is a placeholder directory item.</p>
              <div className="mt-auto">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Fetch directory data from Supabase
 */
async function getDirectoryData(slug: string): Promise<Directory | null> {
  console.log(`[DEBUG] Fetching directory data for slug: ${slug}`);
  const supabase = createServerClient();
  
  try {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error(`[DEBUG] Error fetching directory data: ${error.message}`);
      return null;
    }
    
    if (!data) {
      console.error(`[DEBUG] No data returned from Supabase for slug: ${slug}`);
      return null;
    }
    
    console.log(`[DEBUG] Successfully retrieved directory data for: ${data.name}`);
    return data as Directory;
  } catch (error) {
    console.error('[DEBUG] Exception in getDirectoryData:', error);
    return null;
  }
}

/**
 * Generate metadata for the page based on directory data
 */
export async function generateMetadata({ params }: DirectoryPageProps): Promise<Metadata> {
  const { slug } = params;
  const directoryData = await getDirectoryData(slug);
  
  return {
    title: directoryData?.name || `${slug} Directory`,
    description: directoryData?.description || `Find listings in the ${slug} directory.`,
    openGraph: {
      title: directoryData?.name || `${slug} Directory`,
      description: directoryData?.description || `Find listings in the ${slug} directory.`,
    },
  };
}

// Testimonial component for the directory page
function Testimonial({ quote, author, role }: { quote: string, author: string, role?: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="text-yellow-500 flex items-center mb-2">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="w-4 h-4 mr-1" />
        ))}
      </div>
      <p className="text-gray-700 italic mb-4">"{quote}"</p>
      <div>
        <p className="font-semibold">{author}</p>
        {role && <p className="text-gray-500 text-sm">{role}</p>}
      </div>
    </div>
  );
}

// Feature item component for the directory page
function FeatureItem({ icon, title, description, primaryColor }: 
  { icon: React.ReactNode, title: string, description: string, primaryColor: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div 
        className="w-14 h-14 flex items-center justify-center rounded-full mb-4"
        style={{ backgroundColor: primaryColor, color: '#ffffff' }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

/**
 * Directory page component displaying a specific directory
 */
export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { slug } = params;
  
  console.log(`[DEBUG Page] Rendering directory page for slug: ${slug}`);
  
  // Get directory data from Supabase
  const directoryData = await getDirectoryData(slug);
  
  if (!directoryData) {
    console.error(`[DEBUG Page] No directory data found for slug: ${slug}`);
    notFound();
    return null;
  }
  
  console.log(`[DEBUG Page] Found directory data for: ${directoryData.name}`, {
    slug: directoryData.directory_slug,
    features: directoryData?.features || []
  });
  
  // Calculate theme colors from directory data for server rendering
  // These will be overridden by the DirectoryContext on the client
  const themeColors = {
    primary: directoryData.brand_color_primary || '#1e40af',
    secondary: directoryData.brand_color_secondary || '#1e3a8a',
    accent: directoryData.brand_color_accent || '#f97316',
    primaryText: getTextColorForBackground(directoryData.brand_color_primary || '#1e40af'),
    secondaryText: getTextColorForBackground(directoryData.brand_color_secondary || '#1e3a8a'),
    accentText: getTextColorForBackground(directoryData.brand_color_accent || '#f97316')
  };
  
  // Use the component registry to dynamically select the appropriate components
  // based on directory features rather than hardcoded slug checks
  const SearchFormComponent = getSearchFormComponent(directoryData);
  const ListWrapperComponent = getListWrapperComponent(directoryData);
  
  // Default testimonials that can be overridden by directory-specific data
  const testimonials = [
    {
      quote: "I found exactly what I needed in minutes. The service was excellent!",
      author: "Alex Johnson",
      role: "Customer"
    },
    {
      quote: "Fast, reliable, and easy to use. Highly recommend this directory!",
      author: "Sam Williams",
      role: "Regular User"
    },
    {
      quote: "Saved me hours of searching. This is now my go-to resource.",
      author: "Jordan Taylor",
      role: "Satisfied Client"
    }
  ];
  
  // Default features that highlight the benefits of using this directory
  const features = [
    {
      icon: <FaSearch className="w-6 h-6" />,
      title: "Easy Search",
      description: "Find exactly what you need with our powerful search and filtering options."
    },
    {
      icon: <FaMapMarkerAlt className="w-6 h-6" />,
      title: "Location-Based",
      description: "Discover services near you with our accurate geolocation search."
    },
    {
      icon: <FaMobileAlt className="w-6 h-6" />,
      title: "Mobile Friendly",
      description: "Access our directory from any device, anywhere, anytime."
    },
    {
      icon: <FaClock className="w-6 h-6" />,
      title: "Save Time",
      description: "Quickly connect with verified professionals in your area."
    }
  ];
  
  // Determine if we should use "notaries" or a more generic term based on the directory
  const serviceLabel = directoryData.directory_slug.includes('notary') ? 'Notaries' : 'Professionals';
  
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-100 to-white opacity-70"></div>
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundColor: themeColors.primary,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
          }}
        ></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="block">{directoryData.name}</span>
            </h1>
            
            <p className="text-xl text-gray-700 mb-8">
              {directoryData.description || `Find verified ${serviceLabel.toLowerCase()} in your area quickly and easily.`}
            </p>
            
            {/* Search Form Section */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: themeColors.primary }}>
                Find a {serviceLabel.slice(0, -1)} Near You
              </h2>
              
              <SearchComponentWrapper 
                slug={params.slug} 
                directoryData={directoryData}
                themeColors={themeColors}
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Use {directoryData.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <FeatureItem 
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                primaryColor={themeColors.primary}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Main Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {ListWrapperComponent && (
            <ListWrapperComponent 
              slug={params.slug} 
              directoryData={directoryData}
              themeColors={themeColors}
            />
          )}
        </div>
      </section>
      
      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Trusted by Thousands</h2>
          <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Join the thousands of people who use {directoryData.name} to find reliable {serviceLabel.toLowerCase()} every day.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Testimonial 
                key={index}
                quote={testimonial.quote}
                author={testimonial.author}
                role={testimonial.role}
              />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h3 className="text-xl font-semibold mb-6">Our Quality Guarantee</h3>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center">
                <FaCheckCircle className="w-5 h-5 mr-2" style={{ color: themeColors.primary }} />
                <span>Verified Providers</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="w-5 h-5 mr-2" style={{ color: themeColors.primary }} />
                <span>Accurate Information</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="w-5 h-5 mr-2" style={{ color: themeColors.primary }} />
                <span>Regularly Updated</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="w-5 h-5 mr-2" style={{ color: themeColors.primary }} />
                <span>Real User Reviews</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16" style={{ backgroundColor: themeColors.primary }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6" style={{ color: themeColors.primaryText }}>
            Ready to Find a {serviceLabel.slice(0, -1)}?
          </h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: themeColors.primaryText }}>
            Start your search now and connect with trusted {serviceLabel.toLowerCase()} in your area.
          </p>
          <Link 
            href={`/directory/${slug}/search`}
            className="inline-block px-8 py-3 text-lg font-medium rounded-lg shadow-md transition-transform hover:scale-105"
            style={{ 
              backgroundColor: themeColors.accent,
              color: themeColors.accentText
            }}
          >
            Search Now
          </Link>
        </div>
      </section>
    </div>
  );
}

// Types for the page props
interface DirectoryPageProps {
  params: {
    slug: string;
  };
}
