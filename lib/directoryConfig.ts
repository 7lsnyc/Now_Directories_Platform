/**
 * Directory configuration helper
 * 
 * Provides utilities for working with directory configurations
 * in a consistent and reliable way across environments.
 */

import { createClient } from './supabase/server';
import { Directory } from '@/types/directory';

/**
 * Get directory configuration from Supabase database
 * Uses server-side Supabase client for SSR compatibility
 */
export async function getDirectoryConfig(slug: string): Promise<Directory | null> {
  try {
    // Get directory from Supabase using server client
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', slug)
      .eq('is_active', true)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        console.warn(`Directory not found for slug: ${slug}`);
        return null;
      }
      
      console.error('Error fetching directory config from Supabase:', error.message);
      throw error;
    }
    
    console.log('Found directory in database:', slug);
    return data as Directory;
  } catch (error) {
    console.error('Error in getDirectoryConfig:', 
      error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}
