import HeroSection from '@/components/platform/HeroSection';
import DirectoriesGrid from '@/components/platform/DirectoriesGrid';
import FooterPlatform from '@/components/platform/FooterPlatform';
import HeaderPlatform from '@/components/platform/HeaderPlatform';

/**
 * Platform homepage for Now Directories
 * Serves as the aggregator for all directory services
 */
export default function PlatformHomePage() {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <HeaderPlatform />
      
      <main className="flex-grow">
        <HeroSection />
        <DirectoriesGrid />
      </main>
      
      <FooterPlatform />
    </div>
  );
}
