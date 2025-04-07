-- Migration: Add search radius configuration to directories table
-- This script adds default_search_radius to the directories table 
-- and sets default values for existing directories

-- First, add the column if it doesn't exist
ALTER TABLE public.directories 
ADD COLUMN IF NOT EXISTS default_search_radius INTEGER;

-- Comment on the column to document its purpose
COMMENT ON COLUMN public.directories.default_search_radius IS 'Default search radius in miles for this directory';

-- Update existing directories with sensible defaults
-- For notaryfindernow, set a default of 25 miles
UPDATE public.directories
SET default_search_radius = 25
WHERE directory_slug = 'notaryfindernow';

-- For plumberfindernow, set a default of 20 miles
UPDATE public.directories
SET default_search_radius = 20
WHERE directory_slug = 'plumberfindernow';

-- Set any remaining directories to a standard default of 20 miles
UPDATE public.directories
SET default_search_radius = 20
WHERE default_search_radius IS NULL;

-- Make sure search radius has a reasonable fallback
ALTER TABLE public.directories
ALTER COLUMN default_search_radius SET DEFAULT 20;

-- Update the RLS policies to allow read access to the default_search_radius column
ALTER POLICY "Allow public read access to directories" ON public.directories
USING (is_public = true);

-- Display the updated directories
SELECT id, name, directory_slug, default_search_radius, features FROM public.directories;
