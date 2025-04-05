import Link from 'next/link';
import { FaClock } from 'react-icons/fa';

/**
 * Platform-specific footer component for the Now Directories aggregator homepage
 * Contains company branding, navigation links, and legal information
 * Responsive layout with 4 columns on desktop and 1 column on mobile
 */
export default function FooterPlatform() {
  return (
    <footer className="bg-black text-gray-300 border-t border-gray-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 py-12 max-w-[1200px] mx-auto">
        {/* Column 1: Now Directories Brand */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center">
            <FaClock className="w-5 h-5 mr-2" />
            <h3 className="text-xl font-bold text-white">Now Directories</h3>
          </div>
          <p className="text-sm">
            Connecting professionals with clients through specialized directories for every industry.
          </p>
        </div>

        {/* Column 2: Company Links */}
        <div>
          <h4 className="text-white font-medium mb-4">Company</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/about" className="hover:text-white transition-colors duration-200">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors duration-200">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/press" className="hover:text-white transition-colors duration-200">
                Press
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Resources Links */}
        <div>
          <h4 className="text-white font-medium mb-4">Resources</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/for-investors" className="hover:text-white transition-colors duration-200">
                For Investors
              </Link>
            </li>
            <li>
              <Link href="/for-partners" className="hover:text-white transition-colors duration-200">
                For Partners
              </Link>
            </li>
            <li>
              <Link href="/docs" className="hover:text-white transition-colors duration-200">
                Documentation
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Legal Links */}
        <div>
          <h4 className="text-white font-medium mb-4">Legal</h4>
          <ul className="space-y-3">
            <li>
              <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-white transition-colors duration-200">
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Copyright Notice */}
      <div className="border-t border-gray-800 px-6 py-4">
        <div className="max-w-[1200px] mx-auto text-sm text-center">
          &copy; {new Date().getFullYear()} Now Directories. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
