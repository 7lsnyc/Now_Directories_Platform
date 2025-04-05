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
      className={`${color} relative p-6 rounded-lg transition-transform hover:scale-105`}
    >
      <IconComponent className="w-8 h-8 text-white mb-3" />
      <h3 className="text-lg font-semibold text-white mb-1">{title}</h3>
      <p className="text-sm text-white/80">{description}</p>
      
      {isNew && (
        <span className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
          NEW
        </span>
      )}
    </a>
  );
}
