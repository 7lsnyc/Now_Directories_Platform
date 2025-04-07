// app/directory/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Directory } from '@/types/directory';
import dynamic from 'next/dynamic';
import NotaryListWrapper from '@/components/notary/NotaryListWrapper';
import DirectoryLayout from '@/components/directory/DirectoryLayout';
import { DirectoryProvider } from '@/components/directory/DirectoryContext';

// Dynamically import directory-specific components
// const NotaryFinderNow = dynamic(() => import('./notaryfindernow'), {
//   loading: () => <DirectoryPageSkeleton />
// });

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
            {/* Placeholder search form */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              Search form placeholder
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
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) {
      console.error(`[DEBUG] Error fetching directory data for ${slug}:`, error);
      return null;
    }
    
    if (!data) {
      console.warn(`[DEBUG] No directory data found for ${slug}`);
      return null;
    }
    
    console.log(`[DEBUG] Successfully retrieved directory data for ${slug}:`, {
      id: data.id,
      name: data.name,
      directory_slug: data.directory_slug
    });
    
    return data as Directory;
  } catch (err) {
    console.error(`[DEBUG] Unexpected error in getDirectoryData for ${slug}:`, err);
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
    title: directoryData?.name || 'Directory',
    description: directoryData?.description || 'Find listings in our directory',
  };
}

/**
 * Directory page component displaying a specific directory
 */
export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { slug } = params;
  
  console.log(`[DEBUG Page] Rendering directory page for slug: ${slug}`);
  
  // Fetch directory data from Supabase
  const directoryData = await getDirectoryData(slug);
  
  // If no directory is found, return a 404
  if (!directoryData) {
    console.error(`[DEBUG Page] No directory data found for ${slug}, returning 404`);
    notFound();
  }
  
  console.log(`[DEBUG Page] Successfully fetched directory data for ${slug}`, {
    id: directoryData?.id,
    name: directoryData?.name,
    directory_slug: directoryData?.directory_slug
  });
  
  return (
    <DirectoryProvider initialDirectory={directoryData}>
      <DirectoryLayout directory={directoryData}>
        {/* Main directory content */}
        {slug === 'notaryfindernow' ? (
          <NotaryListWrapper slug={slug} />
        ) : (
          <GenericDirectoryContent directory={directoryData} />
        )}
      </DirectoryLayout>
    </DirectoryProvider>
  );
}

// Types for the page props
interface DirectoryPageProps {
  params: {
    slug: string;
  };
}
