-- Enable PostGIS extension for spatial queries in Supabase
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add a location column to the notaries table for spatial indexing
ALTER TABLE public.notaries
ADD COLUMN IF NOT EXISTS location GEOGRAPHY(POINT);

-- Update existing notary records to populate the location column from lat/long
UPDATE public.notaries
SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create a spatial index on the location column for better performance
CREATE INDEX IF NOT EXISTS idx_notaries_location ON public.notaries USING GIST(location);

-- Add a default_search_radius column to the directories table
ALTER TABLE public.directories
ADD COLUMN IF NOT EXISTS default_search_radius INTEGER DEFAULT 20;
