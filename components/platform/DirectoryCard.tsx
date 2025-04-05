import React from 'react';
import { 
  Shield,
  ShieldCheck,  
  Stethoscope,  
  PawPrint,    
  Key, 
  Zap, 
  Wrench, 
  Droplet,    
  Stamp, 
  Home, 
  Truck, 
  Car, 
  Skull, 
  TreePine,   
  Baby, 
  MonitorSmartphone
} from 'lucide-react';

export interface DirectoryCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  url: string;
  isNew?: boolean;
}

/**
 * Directory card component displaying a single directory with icon, title and description
 * Cards are clickable and open the directory URL in a new tab
 */
export default function DirectoryCard({ icon, title, description, color, url, isNew = false }: DirectoryCardProps) {
  // Map icon strings to Lucide icon components with exact names from the library
  const iconMap: Record<string, React.ElementType> = {
    'Shield': Shield,
    'ShieldCheck': ShieldCheck,  
    'Tooth': Stethoscope,
    'Paw': PawPrint,
    'Key': Key,
    'Zap': Zap,
    'Wrench': Wrench,
    'Droplet': Droplet,
    'Stamp': Stamp,
    'Home': Home,
    'Truck': Truck,
    'Car': Car,
    'Skull': Skull,
    'Tree': TreePine,
    'Baby': Baby,
    'MonitorSmartphone': MonitorSmartphone
  };
  
  // Get the icon component or default to Shield
  const IconComponent = iconMap[icon] || Shield;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${color} relative p-4 sm:p-6 rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex flex-col h-full`}
      aria-label={`${title} - ${description}`}
    >
      <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white mb-2 sm:mb-3" />
      <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-white/90">{description}</p>
      
      {isNew && (
        <span className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
          NEW
        </span>
      )}
    </a>
  );
}
