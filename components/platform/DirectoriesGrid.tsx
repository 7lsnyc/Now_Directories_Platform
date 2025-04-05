import { FaShield } from 'react-icons/fa6';
import { directories } from '@/data/directories';

/**
 * Directories grid for the platform homepage
 * Displays all available directories with their branding
 */
export default function DirectoriesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
      {directories.map((directory, index) => (
        <a
          key={`${directory.title}-${index}`}
          href={directory.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${directory.color} p-4 rounded-lg transition hover:opacity-90 group flex flex-col`}
        >
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 flex items-center justify-center bg-white/20 rounded-full mr-3">
              <FaShield className="text-white w-5 h-5" />
            </div>
            <div className="flex items-center">
              <h3 className="font-bold text-white">{directory.title}</h3>
              {directory.isNew && (
                <span className="bg-white text-black text-xs rounded px-2 py-0.5 ml-2 font-medium">
                  NEW
                </span>
              )}
            </div>
          </div>
          <p className="text-white/80 text-sm">{directory.tagline}</p>
        </a>
      ))}
    </div>
  );
}
