/**
 * Directory configuration helper
 * 
 * Provides utilities for working with directory configurations
 * in both development and production environments.
 */

import { createClient } from './supabase/server';
import { Directory } from '@/types/directory';
import path from 'path';
import fs from 'fs';

/**
 * Get directory configuration from either Supabase database
 * or local file system during development
 */
export async function getDirectoryConfig(slug: string): Promise<Directory | null> {
  try {
    // Try to get directory from Supabase first
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (data && !error) {
      console.log('Found directory in database:', slug);
      return data as Directory;
    }
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching directory config from Supabase:', error.message);
    }
    
    // Fall back to local config file during development
    if (process.env.NODE_ENV === 'development') {
      try {
        const configPath = path.join(process.cwd(), 'config', 'directories', `${slug}.json`);
        if (fs.existsSync(configPath)) {
          const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
          console.log('Using local config file for directory:', slug);
          return configData as Directory;
        }
      } catch (fsError) {
        console.error('Error reading local config file:', fsError);
      }
    }
    
    console.warn('Config file not found for slug:', slug);
    return null;
  } catch (error) {
    console.error('Error in getDirectoryConfig:', error);
    return null;
  }
}
