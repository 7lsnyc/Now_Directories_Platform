import Link from 'next/link';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';

/**
 * Generic Error Page
 * Shown when an unexpected error occurs
 */
export default function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <ExclamationCircleIcon className="text-red-600 h-16 w-16" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        
        <p className="text-gray-600 mb-6">
          Sorry, we encountered an unexpected error. Please try again later.
        </p>
        
        <Link 
          href="https://nowdirectories.com" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Return to Now Directories
        </Link>
      </div>
    </div>
  );
}
