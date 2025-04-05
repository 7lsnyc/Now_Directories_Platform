import { directories } from '@/data/directories';
import DirectoryCard from './DirectoryCard';

/**
 * Directories grid for the platform homepage
 * Displays all available directories with their branding and allows navigation to each directory
 */
export default function DirectoriesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {directories.map((directory, index) => (
        <DirectoryCard
          key={`${directory.title}-${index}`}
          title={directory.title}
          tagline={directory.tagline}
          icon={directory.icon || 'Shield'}
          color={directory.color}
          url={directory.url}
          isNew={directory.isNew}
        />
      ))}
    </div>
  );
}
