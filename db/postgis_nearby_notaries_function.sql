-- Enable PostGIS extension if not already enabled
CREATE EXTENSION IF NOT EXISTS postgis;

-- Check if geography column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notaries' AND column_name = 'location'
  ) THEN
    -- Add geography column
    ALTER TABLE notaries ADD COLUMN location geography(Point,4326);
    
    -- Populate it from latitude and longitude (where both values exist)
    UPDATE notaries 
    SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
    WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    
    -- Create spatial index for better performance
    CREATE INDEX notaries_location_idx ON notaries USING gist (location);
  END IF;
END $$;

-- Create the nearby_notaries function
CREATE OR REPLACE FUNCTION nearby_notaries(
  lat numeric,
  lng numeric,
  radius_miles numeric,
  dir_slug text,
  min_rating numeric DEFAULT NULL,
  service_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  zip text,
  latitude numeric,
  longitude numeric,
  rating numeric,
  review_count integer,
  services text[],
  directory_slug text,
  created_at timestamptz,
  updated_at timestamptz,
  distance_meters float
)
LANGUAGE plpgsql
AS $$
DECLARE
  search_point geography;
  radius_meters float;
BEGIN
  -- Convert miles to meters for PostGIS
  radius_meters := radius_miles * 1609.34;
  
  -- Create geography point from input coordinates
  search_point := ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
  
  -- Start with a base query filtering by directory_slug
  RETURN QUERY
  SELECT 
    n.*,
    -- Calculate distance in meters and include it as an additional column
    ST_Distance(n.location, search_point) AS distance_meters
  FROM 
    notaries n
  WHERE 
    -- Filter by directory slug
    n.directory_slug = dir_slug
    
    -- Only include points within the radius
    AND (
      -- Either use the location column if available
      (n.location IS NOT NULL AND ST_DWithin(n.location, search_point, radius_meters))
      -- Or calculate distance on the fly if location is NULL but lat/lng are available
      OR (
        n.location IS NULL 
        AND n.latitude IS NOT NULL 
        AND n.longitude IS NOT NULL 
        AND ST_DWithin(
          ST_SetSRID(ST_MakePoint(n.longitude, n.latitude), 4326)::geography,
          search_point,
          radius_meters
        )
      )
    )
    
    -- Apply minimum rating filter if provided
    AND (min_rating IS NULL OR n.rating >= min_rating)
    
    -- Apply service type filter if provided
    AND (service_type IS NULL OR service_type = ANY(n.services))
    
  -- Order by distance (closest first)
  ORDER BY 
    distance_meters ASC;
END;
$$;

-- Sample usage of the function
-- SELECT * FROM nearby_notaries(40.7128, -74.0060, 20, 'notaryfindernow', 3.5, 'Mobile Notary');
