import { platformDirectories } from '@/data/platform-directories';
import DirectoryCard from './DirectoryCard';

/**
 * Grid component that displays all platform directories 
 * Responsive layout with 1-3 columns depending on screen size
 */
export default function DirectoriesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full">
      {platformDirectories.map((directory, index) => (
        <DirectoryCard
          key={`${directory.title}-${index}`}
          title={directory.title}
          description={directory.description}
          icon={directory.icon}
          color={directory.color}
          url={directory.url}
          isNew={directory.isNew}
        />
      ))}
    </div>
  );
}
