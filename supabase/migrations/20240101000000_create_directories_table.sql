-- Create directories table for multi-domain support
CREATE TABLE IF NOT EXISTS directories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Core fields
  name TEXT NOT NULL,
  directory_slug TEXT NOT NULL UNIQUE,
  domain TEXT UNIQUE,
  description TEXT,
  
  -- Display and branding
  icon_name TEXT NOT NULL,
  logo_url TEXT,
  icon_url TEXT,
  brand_color_primary TEXT NOT NULL DEFAULT '#1e40af', -- Default blue color
  brand_color_secondary TEXT DEFAULT '#1e3a8a',
  brand_color_accent TEXT DEFAULT '#f97316',
  
  -- Settings
  is_public BOOLEAN NOT NULL DEFAULT TRUE,
  is_searchable BOOLEAN NOT NULL DEFAULT TRUE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  priority INTEGER NOT NULL DEFAULT 0, -- For ordering
  
  -- Constraints
  CONSTRAINT directory_slug_check CHECK (directory_slug ~* '^[a-z0-9][a-z0-9-]*$')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS directories_directory_slug_idx ON directories(directory_slug);
CREATE INDEX IF NOT EXISTS directories_domain_idx ON directories(domain);

-- Set up Row Level Security (RLS)
ALTER TABLE directories ENABLE ROW LEVEL SECURITY;

-- Create RLS policy - only admins can insert/update/delete
CREATE POLICY admin_all ON directories 
  FOR ALL 
  USING (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.role() = 'authenticated' AND auth.jwt() ->> 'role' = 'admin');

-- Everyone can select public directories
CREATE POLICY users_select ON directories
  FOR SELECT
  USING (is_public = true OR auth.role() = 'authenticated');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
CREATE TRIGGER set_directories_updated_at
BEFORE UPDATE ON directories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Insert sample data for existing directories
INSERT INTO directories (
  name, 
  directory_slug, 
  domain, 
  description, 
  icon_name, 
  brand_color_primary, 
  brand_color_secondary, 
  brand_color_accent
)
VALUES 
-- Notary Directory
(
  'Notary Directory', 
  'notary', 
  'notary.nowdirectories.com', 
  'Find notaries near you', 
  'Stamp', 
  '#1e40af', 
  '#1e3a8a', 
  '#f97316'
),
-- Passport Directory  
(
  'Passport Directory', 
  'passport', 
  'passport.nowdirectories.com', 
  'Find passport offices and expeditors', 
  'ShieldCheck', 
  '#047857', 
  '#065f46', 
  '#ea580c'
),
-- Dental Directory
(
  'Dental Directory', 
  'dental', 
  'dental.nowdirectories.com', 
  'Find dentists and specialists near you', 
  'Tooth', 
  '#0e7490', 
  '#0369a1', 
  '#f97316'
)
ON CONFLICT (directory_slug) DO NOTHING;
