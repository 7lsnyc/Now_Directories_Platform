/**
 * Seed script to create or update the notaryfindernow directory entry in Supabase
 * Run with: node scripts/seed-notary-directory.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Directory data to seed
const notaryFinderNowDirectory = {
  directory_slug: 'notaryfindernow',
  domain: 'notaryfindernow.com',
  name: 'Notary Finder Now',
  title: 'Find Trusted Notaries in Your Area | Notary Finder Now',
  description: 'Easily find verified notaries near you with our location-based search. Filter by service type and ratings.',
  icon_url: '/icons/key.svg',
  logo_url: '/logos/notaryfindernow.png',
  is_active: true,
  theme: {
    colors: {
      primary: '#1e40af',   // Blue
      secondary: '#1e3a8a', // Darker blue
      accent: '#3b82f6'     // Lighter blue
    }
  },
  navigation: {
    header: {
      links: [
        { text: 'Home', url: '/' },
        { text: 'Search', url: '/search' }
      ],
      ctaButton: {
        text: 'Request Featured Listing',
        url: '/request-listing'
      }
    },
    footer: {
      quickLinks: [
        { text: 'Home', url: '/' },
        { text: 'Search', url: '/search' },
        { text: 'About Us', url: '/about' }
      ],
      services: [
        { text: 'Mobile Notary', url: '/services/mobile' },
        { text: 'Loan Signing', url: '/services/loan-signing' },
        { text: 'Apostille', url: '/services/apostille' }
      ],
      support: [
        { text: 'Contact Us', url: '/contact' },
        { text: 'Privacy Policy', url: '/privacy' },
        { text: 'Terms of Service', url: '/terms' }
      ]
    }
  }
};

/**
 * Seed the notaryfindernow directory
 */
async function seedNotaryDirectory() {
  console.log('🌱 Checking if notaryfindernow directory already exists...');
  
  // Check if directory already exists
  const { data: existingDirectory, error: fetchError } = await supabase
    .from('directories')
    .select('*')
    .eq('directory_slug', 'notaryfindernow')
    .single();
  
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('Error checking for existing directory:', fetchError);
    process.exit(1);
  }
  
  if (existingDirectory) {
    console.log('✅ Directory already exists. Updating...');
    
    // Update existing directory
    const { error: updateError } = await supabase
      .from('directories')
      .update(notaryFinderNowDirectory)
      .eq('directory_slug', 'notaryfindernow');
    
    if (updateError) {
      console.error('Error updating directory:', updateError);
      process.exit(1);
    }
    
    console.log('✅ Directory updated successfully!');
  } else {
    console.log('🆕 Directory does not exist. Creating...');
    
    // Insert new directory
    const { error: insertError } = await supabase
      .from('directories')
      .insert(notaryFinderNowDirectory);
    
    if (insertError) {
      console.error('Error creating directory:', insertError);
      process.exit(1);
    }
    
    console.log('✅ Directory created successfully!');
  }
  
  // Verify the directory exists now
  const { data: verifyData, error: verifyError } = await supabase
    .from('directories')
    .select('*')
    .eq('directory_slug', 'notaryfindernow')
    .single();
  
  if (verifyError) {
    console.error('Error verifying directory:', verifyError);
    process.exit(1);
  }
  
  console.log('✅ Directory verified in database:');
  console.log(JSON.stringify(verifyData, null, 2));
}

// Run the seed function
seedNotaryDirectory()
  .catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
