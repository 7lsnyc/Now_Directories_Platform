import Link from 'next/link';

/**
 * Hero section for the Now Directories platform homepage
 * Displays the main value proposition and call-to-action
 */
export default function HeroSection() {
  return (
    <section className="w-full bg-gray-900">
      <div className="max-w-5xl mx-auto py-12 md:py-16 px-4 sm:px-6 text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
          Curated Directories for Life's Emergencies
        </h1>
        
        <p className="text-gray-300 text-sm sm:text-base md:text-lg max-w-3xl mx-auto mb-6 sm:mb-8">
          Now Directories is a portfolio of profitable, high-intent local directories powered by our own custom platform. The business is SEO-validated, monetized, and systematized — with clear expansion paths and product-led growth opportunities.
        </p>
        
        <Link 
          href="/contact" 
          className="inline-block bg-white text-black font-medium py-2 sm:py-3 px-4 sm:px-5 rounded-md hover:bg-gray-100 transition-colors"
        >
          Need a directory? Contact us
        </Link>
      </div>
    </section>
  );
}
