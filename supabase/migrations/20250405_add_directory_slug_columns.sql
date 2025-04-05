-- Add directory_slug column to tables that need tenant isolation
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS directory_slug TEXT NOT NULL DEFAULT 'platform';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS directory_slug TEXT NOT NULL DEFAULT 'platform';
ALTER TABLE providers ADD COLUMN IF NOT EXISTS directory_slug TEXT NOT NULL DEFAULT 'platform';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS directory_slug TEXT NOT NULL DEFAULT 'platform';

-- Set NOT NULL constraint after adding the column with a default value
-- This ensures existing data gets the default 'platform' value
ALTER TABLE profiles ALTER COLUMN directory_slug SET NOT NULL;
ALTER TABLE listings ALTER COLUMN directory_slug SET NOT NULL;
ALTER TABLE providers ALTER COLUMN directory_slug SET NOT NULL;
ALTER TABLE reviews ALTER COLUMN directory_slug SET NOT NULL;

-- Add indexes for performance on directory_slug lookups
CREATE INDEX IF NOT EXISTS idx_profiles_directory_slug ON profiles(directory_slug);
CREATE INDEX IF NOT EXISTS idx_listings_directory_slug ON listings(directory_slug);
CREATE INDEX IF NOT EXISTS idx_providers_directory_slug ON providers(directory_slug);
CREATE INDEX IF NOT EXISTS idx_reviews_directory_slug ON reviews(directory_slug);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
