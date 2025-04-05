import React from 'react';
import Link from 'next/link';
import clsx from 'clsx';

// Import icons
import { 
  FaKey, FaWrench, FaFaucet, FaWater, 
  FaThermometerHalf, FaBolt, FaBroom, 
  FaPassport, FaCarAlt, FaTree, 
  FaTools, FaHeadset, FaLaptopCode, 
  FaMortarPestle, FaWineBottle
} from 'react-icons/fa';

// Directory card type definition
export type DirectoryCardProps = {
  title: string;
  tagline: string;
  icon: string;
  color: string;
  isNew?: boolean;
  url: string;
};

// Icon mapping to handle different icon types
const iconMap: Record<string, React.ReactNode> = {
  notary: <FaKey className="w-6 h-6" />,
  plumbing: <FaFaucet className="w-6 h-6" />,
  locksmith: <FaWrench className="w-6 h-6" />,
  water: <FaWater className="w-6 h-6" />,
  hvac: <FaThermometerHalf className="w-6 h-6" />,
  electrical: <FaBolt className="w-6 h-6" />,
  cleaning: <FaBroom className="w-6 h-6" />,
  passport: <FaPassport className="w-6 h-6" />,
  towing: <FaCarAlt className="w-6 h-6" />,
  tree: <FaTree className="w-6 h-6" />,
  repair: <FaTools className="w-6 h-6" />,
  it: <FaLaptopCode className="w-6 h-6" />,
  handyman: <FaTools className="w-6 h-6" />,
  visa: <FaPassport className="w-6 h-6" />,
  bands: <FaMortarPestle className="w-6 h-6" />,
  support: <FaHeadset className="w-6 h-6" />,
  alcohol: <FaWineBottle className="w-6 h-6" />
};

const DirectoryCard: React.FC<DirectoryCardProps> = ({
  title,
  tagline,
  icon,
  color,
  isNew = false,
  url,
}) => {
  return (
    <Link 
      href={url} 
      target="_blank"
      rel="noopener noreferrer" 
      className={clsx(
        color, // Dynamic background color
        'rounded-xl p-4 text-white flex flex-col justify-between h-[120px]',
        'hover:scale-105 transition-transform duration-200 shadow-md',
        'relative overflow-hidden'
      )}
      aria-label={`Visit ${title} directory`}
    >
      <div className="flex justify-between items-start">
        <div className="text-white">
          {iconMap[icon] || <FaKey className="w-6 h-6" />}
        </div>
        {isNew && (
          <span className="bg-white text-black text-xs font-medium px-2 py-0.5 rounded">
            NEW
          </span>
        )}
      </div>
      
      <div className="mt-auto">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/80">{tagline}</p>
      </div>
    </Link>
  );
};

export default DirectoryCard;
