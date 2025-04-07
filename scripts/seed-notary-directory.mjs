#!/usr/bin/env node

/**
 * Seed script to create or update the notaryfindernow directory entry in Supabase
 * Run with: node scripts/seed-notary-directory.mjs
 * 
 * This script will check if the notaryfindernow directory exists in the database
 * and create it if it doesn't, or update it if it already exists.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');
dotenv.config({ path: envPath });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\x1b[31m%s\x1b[0m', 'Missing Supabase environment variables. Please check your .env.local file.');
  console.log('You need to have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY defined.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Directory data to seed
const notaryFinderNowDirectory = {
  name: 'Notary Finder Now',
  directory_slug: 'notaryfindernow',
  domain: 'notaryfindernow.com',
  description: 'Find trusted notaries near you with our location-based search.',
  icon_name: 'key',
  icon_url: '/icons/key.svg',
  logo_url: '/logos/notaryfindernow.png',
  brand_color_primary: '#1e40af',
  brand_color_secondary: '#1e3a8a',
  brand_color_accent: '#3b82f6',
  is_public: true,
  is_searchable: true,
  is_active: true,
  priority: 10
};

/**
 * Seed the notaryfindernow directory
 */
async function seedNotaryDirectory() {
  console.log('\x1b[34m%s\x1b[0m', '🔍 Checking if notaryfindernow directory already exists...');
  
  try {
    // Check if directory already exists
    const { data: existingDirectory, error: fetchError } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', 'notaryfindernow')
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Error checking for existing directory: ${fetchError.message}`);
    }
    
    if (existingDirectory) {
      console.log('\x1b[33m%s\x1b[0m', '📝 Directory already exists. Updating...');
      
      // Update existing directory
      const { error: updateError } = await supabase
        .from('directories')
        .update(notaryFinderNowDirectory)
        .eq('directory_slug', 'notaryfindernow');
      
      if (updateError) {
        throw new Error(`Error updating directory: ${updateError.message}`);
      }
      
      console.log('\x1b[32m%s\x1b[0m', '✅ Directory updated successfully!');
    } else {
      console.log('\x1b[33m%s\x1b[0m', '🆕 Directory does not exist. Creating...');
      
      // Insert new directory
      const { error: insertError } = await supabase
        .from('directories')
        .insert(notaryFinderNowDirectory);
      
      if (insertError) {
        throw new Error(`Error creating directory: ${insertError.message}`);
      }
      
      console.log('\x1b[32m%s\x1b[0m', '✅ Directory created successfully!');
    }
    
    // Verify the directory exists now
    const { data: verifyData, error: verifyError } = await supabase
      .from('directories')
      .select('*')
      .eq('directory_slug', 'notaryfindernow')
      .single();
    
    if (verifyError) {
      throw new Error(`Error verifying directory: ${verifyError.message}`);
    }
    
    console.log('\x1b[32m%s\x1b[0m', '✅ Directory verified in database:');
    console.log(JSON.stringify(verifyData, null, 2));
    
    // Write verification file for reference
    const verificationPath = path.resolve(__dirname, '..', 'scripts', 'seed-verification.json');
    fs.writeFileSync(verificationPath, JSON.stringify(verifyData, null, 2));
    console.log('\x1b[34m%s\x1b[0m', `📄 Verification data saved to ${verificationPath}`);
    
    return verifyData;
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `❌ Error in seedNotaryDirectory: ${error.message}`);
    process.exit(1);
  }
}

// Run the seed function
seedNotaryDirectory()
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', '🎉 Seed process completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\x1b[31m%s\x1b[0m', `❌ Unhandled error: ${error.message}`);
    process.exit(1);
  });
