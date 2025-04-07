// app/directory/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import DirectoryLayout from '@/components/directory/DirectoryLayout';
import { createClient } from '@/lib/supabase/server';
import { DirectoryProvider } from '@/components/directory/DirectoryContext';
import { Directory } from '@/types/directory';
import dynamic from 'next/dynamic';

// Dynamically import directory-specific components
const NotaryFinderNow = dynamic(() => import('./notaryfindernow'), {
  loading: () => <DirectoryPageSkeleton />
});

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
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to {directory.name}
        </h1>
        
        {directory.description && (
          <p className="text-lg text-gray-700 mb-6">{directory.description}</p>
        )}
        
        {/* Directory-specific content would go here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Placeholder for search component */}
          <div className="col-span-full bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Find Listings</h2>
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          {/* Placeholder cards for featured listings */}
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

// Types for the page props
interface DirectoryPageProps {
  params: {
    slug: string;
  };
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ 
  params 
}: DirectoryPageProps): Promise<Metadata> {
  // Get directory data
  const directoryData = await getDirectoryData(params.slug);
  
  if (!directoryData) {
    return {
      title: 'Directory Not Found',
      description: 'The requested directory could not be found.'
    };
  }
  
  return {
    title: directoryData.name,
    description: directoryData.description || `Find listings in the ${directoryData.name}`,
  };
}

/**
 * Fetch directory data from Supabase
 */
async function getDirectoryData(slug: string): Promise<Directory | null> {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('directories')
    .select('*')
    .eq('directory_slug', slug)
    .eq('is_active', true)
    .single();
  
  if (error || !data) {
    console.error('Error fetching directory data:', error);
    return null;
  }
  
  return data as Directory;
}

/**
 * Directory page component displaying a specific directory
 */
export default async function DirectoryPage({ params }: DirectoryPageProps) {
  const { slug } = params;
  
  // Fetch directory data from Supabase
  const directoryData = await getDirectoryData(slug);
  
  // If no directory is found, return a 404
  if (!directoryData) {
    notFound();
  }
  
  return (
    <DirectoryProvider initialDirectory={directoryData}>
      <DirectoryLayout directory={directoryData}>
        {/* Render directory-specific components based on slug */}
        {slug === 'notaryfindernow' ? (
          <NotaryFinderNow directory={directoryData} />
        ) : (
          <GenericDirectoryContent directory={directoryData} />
        )}
      </DirectoryLayout>
    </DirectoryProvider>
  );
}
