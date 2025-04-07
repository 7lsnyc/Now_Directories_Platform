'use client';

/**
 * Directory not found page
 * Displays when a directory is not found in the database
 * 
 * This is used by the middleware when a directory cannot be located in Supabase
 */
export default function DirectoryNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mt-2 text-xl font-bold text-gray-900">Directory Not Found</h2>
          <p className="mt-1 text-sm text-gray-500">
            The directory you're looking for could not be found. It may have been removed or the URL might be incorrect.
          </p>
          <div className="mt-6">
            <a 
              href="https://nowdirectories.com"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Visit Now Directories
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
