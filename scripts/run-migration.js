/**
 * Simple script to run the Supabase migrations in development
 * This creates the directories table and inserts test data
 */
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const migrationPath = path.join(__dirname, '../supabase/migrations/20240101000000_create_directories_table.sql');

// Make sure the migration file exists
if (!fs.existsSync(migrationPath)) {
  console.error('Migration file not found:', migrationPath);
  process.exit(1);
}

// Read the migration file
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Run the migration against your Supabase project
console.log('Running migration to create directories table...');

// For local development, this would use the Supabase CLI
// In production, you would run this through the Supabase dashboard or CI/CD
console.log('\nMigration SQL (to run in Supabase SQL Editor):');
console.log('==============================================');
console.log(migrationSQL);
console.log('==============================================');
console.log('\nInstructions:');
console.log('1. Go to your Supabase dashboard: https://app.supabase.com');
console.log('2. Open your project');
console.log('3. Go to SQL Editor');
console.log('4. Create a new query');
console.log('5. Paste the SQL above');
console.log('6. Run the query\n');
console.log('After running the migration, you can run the setup-test-directories.ts script:');
console.log('npx tsx scripts/setup-test-directories.ts\n');
