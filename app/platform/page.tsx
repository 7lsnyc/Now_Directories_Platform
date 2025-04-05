import HeroSection from '@/components/platform/HeroSection';
import DirectoriesGrid from '@/components/platform/DirectoriesGrid';
import FooterPlatform from '@/components/platform/FooterPlatform';

/**
 * Platform homepage for Now Directories
 * Serves as the aggregator for all directory services
 */
export default function PlatformHomePage() {
  return (
    <main>
      <HeroSection />
      <DirectoriesGrid />
      <FooterPlatform />
    </main>
  );
}
