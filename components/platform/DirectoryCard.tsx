import React, { useEffect } from 'react';
import Link from 'next/link';
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
  domain?: string; // External domain to link to
  isNew?: boolean;
}

/**
 * Directory card component displaying a single directory with icon, title and description
 * Cards are clickable and open the directory URL
 */
export default function DirectoryCard({ 
  icon, 
  title, 
  description, 
  color, 
  url, 
  domain,
  isNew = false 
}: DirectoryCardProps) {
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

  // For local testing, just use the path-based url instead of domain-based
  // This ensures compatibility with the browser preview environment
  const href = url;
  
  // Create card content separate from the link wrapper
  const cardContent = (
    <>
      {/* New badge */}
      {isNew && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
          New
        </span>
      )}
      
      {/* Icon */}
      <div className="text-white mb-3">
        <IconComponent size={32} />
      </div>
      
      {/* Title and description */}
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-white/80 text-sm">{description}</p>
    </>
  );

  return (
    <Link
      href={href}
      className={`${color} relative p-4 sm:p-6 rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 flex flex-col h-full`}
      aria-label={`${title} - ${description}`}
    >
      {cardContent}
    </Link>
  );
}
