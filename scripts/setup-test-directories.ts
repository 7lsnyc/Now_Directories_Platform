/**
 * Script to set up test directories in Supabase
 * Run with: npx tsx scripts/setup-test-directories.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables');
  process.exit(1);
}

// Create Supabase client with admin privileges
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Sample test directories
const testDirectories = [
  {
    name: 'Notary Directory',
    directory_slug: 'notary',
    domain: 'localhost:3000',
    description: 'Find notaries near you',
    icon_name: 'Stamp',
    brand_color_primary: '#1e40af',
    brand_color_secondary: '#1e3a8a',
    brand_color_accent: '#f97316',
    test_domain: 'notary.localhost:3000'
  },
  {
    name: 'Passport Directory',
    directory_slug: 'passport',
    domain: 'localhost:3001',
    description: 'Find passport offices and expeditors',
    icon_name: 'ShieldCheck',
    brand_color_primary: '#047857',
    brand_color_secondary: '#065f46',
    brand_color_accent: '#ea580c',
    test_domain: 'passport.localhost:3000'
  },
  {
    name: 'Dental Directory',
    directory_slug: 'dental',
    domain: 'localhost:3002',
    description: 'Find dentists and specialists near you',
    icon_name: 'Tooth',
    brand_color_primary: '#0e7490',
    brand_color_secondary: '#0369a1',
    brand_color_accent: '#f97316',
    test_domain: 'dental.localhost:3000'
  }
];

// Helper function to update the directories table
async function setupTestDirectories() {
  try {
    console.log('Creating directories table if it doesn\'t exist...');
    
    // First check if the table exists
    const { data: tableExists, error: tableCheckError } = await supabase
      .from('directories')
      .select('id')
      .limit(1);
    
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.log('Table does not exist. Creating directories table...');
      
      // Create table if it doesn't exist
      const { error: createError } = await supabase.rpc('create_directories_table');
      
      if (createError) {
        throw createError;
      }
    }
    
    // Insert or update test directories
    for (const directory of testDirectories) {
      console.log(`Setting up ${directory.name}...`);
      
      const { error } = await supabase
        .from('directories')
        .upsert(
          {
            name: directory.name,
            directory_slug: directory.directory_slug,
            domain: directory.domain,
            description: directory.description,
            icon_name: directory.icon_name,
            brand_color_primary: directory.brand_color_primary,
            brand_color_secondary: directory.brand_color_secondary,
            brand_color_accent: directory.brand_color_accent,
            is_active: true
          },
          { onConflict: 'directory_slug' }
        );
      
      if (error) {
        throw error;
      }
      
      // Also add the test domain as another entry
      await supabase
        .from('directories')
        .upsert(
          {
            name: directory.name,
            directory_slug: directory.directory_slug,
            domain: directory.test_domain,
            description: directory.description,
            icon_name: directory.icon_name,
            brand_color_primary: directory.brand_color_primary,
            brand_color_secondary: directory.brand_color_secondary,
            brand_color_accent: directory.brand_color_accent,
            is_active: true
          },
          { onConflict: 'domain' }
        );
    }
    
    console.log('✅ Test directories set up successfully!');
  } catch (error) {
    console.error('Error setting up test directories:', error);
  }
}

// Run the setup
setupTestDirectories();
