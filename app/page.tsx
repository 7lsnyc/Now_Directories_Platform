import Link from 'next/link';
import { FaClock } from 'react-icons/fa';
import HeroSection from '@/components/platform/HeroSection';
import DirectoriesGrid from '@/components/platform/DirectoriesGrid';
import FooterPlatform from '@/components/platform/FooterPlatform';

/**
 * Main Now Directories homepage
 * Displays the aggregator for all directory services with responsive layout
 */
export default function HomePage() {
  return (
    <div className="bg-black min-h-screen text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-700 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between">
          <Link href="/" className="flex items-center mb-4 sm:mb-0">
            <FaClock className="w-5 h-5 mr-2" />
            <span className="text-lg font-bold">Now Directories</span>
          </Link>
          
          <nav className="flex space-x-6">
            <Link href="/about" className="text-gray-300 hover:text-white transition-colors duration-200">
              About
            </Link>
            <Link href="/contact" className="text-gray-300 hover:text-white transition-colors duration-200">
              Contact
            </Link>
            <Link href="/for-investors" className="text-gray-300 hover:text-white transition-colors duration-200">
              For Investors
            </Link>
            <Link href="/login" className="bg-white text-black px-3 py-1 rounded hover:bg-gray-100 transition-colors duration-200">
              Login / Signup
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Divider between hero and directories */}
        <div className="border-t border-gray-700 w-full my-8"></div>
        
        {/* Directories Section */}
        <section className="py-4 mb-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Our Directories</h2>
            <DirectoriesGrid />
          </div>
        </section>
      </main>

      {/* Footer */}
      <FooterPlatform />
    </div>
  );
}
