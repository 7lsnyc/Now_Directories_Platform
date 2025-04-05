import DirectoryCard from '../components/DirectoryCard';
import { directories } from '../data/directories';
import { FaClock } from 'react-icons/fa';
import Link from 'next/link';
import HeroSection from '@/components/platform/HeroSection';
import DirectoriesGrid from '@/components/platform/DirectoriesGrid';
import FooterPlatform from '@/components/platform/FooterPlatform';

export default function HomePage() {
  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <Link href="/" className="flex items-center mb-4 sm:mb-0">
              <FaClock className="w-6 h-6 mr-2" />
              <span className="text-lg font-bold">Now Directories</span>
            </Link>
            
            <nav className="flex space-x-6">
              <Link href="/about" className="hover:underline text-gray-300 hover:text-white transition">
                About
              </Link>
              <Link href="/contact" className="hover:underline text-gray-300 hover:text-white transition">
                Contact
              </Link>
              <Link href="/for-investors" className="hover:underline text-gray-300 hover:text-white transition">
                For Investors
              </Link>
              <Link href="/login" className="bg-white text-black px-3 py-1 rounded hover:bg-gray-100 transition">
                Login / Signup
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section - Using our new component */}
      <HeroSection />

      {/* Directory Grid - Using our new component */}
      <section className="py-10">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-semibold mb-6 text-white">Our Directories</h2>
          <DirectoriesGrid />
        </div>
      </section>

      {/* Footer - Using our new component */}
      <FooterPlatform />
    </div>
  );
}
