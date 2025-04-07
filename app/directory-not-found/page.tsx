import Link from 'next/link';
import { FaClock } from 'react-icons/fa';

/**
 * Directory Not Found Page
 * Shown when a user visits a domain that isn't mapped to any directory
 */
export default function DirectoryNotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <FaClock className="text-blue-600 h-16 w-16" />
        </div>
        
        <h1 className="text-2xl font-bold mb-4">Directory Not Found</h1>
        
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find a directory associated with this domain.
        </p>
        
        <Link 
          href="https://nowdirectories.com" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
        >
          Visit Now Directories
        </Link>
      </div>
    </div>
  );
}
