import React from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Wrench, 
  Key, 
  Zap, 
  Droplets, 
  BadgePercent, 
  Plane, 
  Stamp, 
  Truck, 
  Car, 
  HardHat, 
  TreePine, 
  Trash2, 
  Baby as BabyIcon, 
  MonitorSmartphone, 
  Hammer, 
  Clock
} from 'lucide-react';

export interface DirectoryCardProps {
  title: string;
  tagline: string;
  icon: string;
  color: string;
  url: string;
  isNew?: boolean;
}

/**
 * Directory card component for displaying individual directory entries
 * Includes icon, title, tagline and optional "NEW" badge
 */
export default function DirectoryCard({ title, tagline, icon, color, url, isNew = false }: DirectoryCardProps) {
  // Map of icon names to Lucide icon components
  const iconMap: Record<string, React.ElementType> = {
    shield: Shield,
    notary: Stamp,
    plumbing: Wrench,
    locksmith: Key,
    electrical: Zap,
    hvac: Wrench,
    water: Droplets,
    bands: BadgePercent,
    passport: Plane,
    visa: Stamp,
    cleaning: Trash2,
    towing: Car,
    repair: Hammer,
    tree: TreePine,
    support: BabyIcon,
    it: MonitorSmartphone,
    handyman: HardHat,
    clock: Clock
  };

  // Get the correct icon or fallback to Shield
  const IconComponent = iconMap[icon.toLowerCase()] || Shield;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${color} rounded-xl p-4 min-h-[100px] text-white flex flex-col justify-between relative hover:opacity-90 transition-opacity`}
    >
      <div>
        <div className="flex items-start mb-2">
          <IconComponent className="w-6 h-6 text-white mr-2 mt-0.5" />
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-white/80">{tagline}</p>
      </div>
      
      {isNew && (
        <span className="absolute top-2 right-2 bg-white text-black text-xs font-bold rounded px-2 py-0.5 uppercase">
          New
        </span>
      )}
    </a>
  );
}
