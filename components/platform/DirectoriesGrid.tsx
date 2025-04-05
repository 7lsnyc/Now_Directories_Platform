import { platformDirectories } from '@/data/platform-directories';
import DirectoryCard from './DirectoryCard';

/**
 * Grid component that displays all platform directories 
 * Responsive layout with 1-3 columns depending on screen size
 */
export default function DirectoriesGrid() {
  return (
    <section className="pt-4 pb-12 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
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
      </div>
    </section>
  );
}
