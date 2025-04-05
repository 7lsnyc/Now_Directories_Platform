-- Enable RLS on all tables that need directory-based isolation
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Create a function to get the current directory slug from request headers
CREATE OR REPLACE FUNCTION get_directory_slug() RETURNS TEXT AS $$
BEGIN
  -- This returns the directory_slug stored in the JWT claim
  -- This is set by our authentication hook when a user logs in
  RETURN current_setting('request.jwt.claims.directory_slug', TRUE);
EXCEPTION
  -- If the setting doesn't exist, return NULL
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for each table to filter by directory_slug

-- Profiles table policies
CREATE POLICY "Public profiles are viewable" ON profiles
  FOR SELECT
  USING (directory_slug = get_directory_slug() OR get_directory_slug() IS NULL);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT
  WITH CHECK (directory_slug = get_directory_slug());

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (directory_slug = get_directory_slug())
  WITH CHECK (directory_slug = get_directory_slug());

-- Listings table policies
CREATE POLICY "Listings are viewable by directory" ON listings
  FOR SELECT
  USING (directory_slug = get_directory_slug() OR get_directory_slug() IS NULL);

CREATE POLICY "Providers can insert listings" ON listings
  FOR INSERT
  WITH CHECK (directory_slug = get_directory_slug());

CREATE POLICY "Providers can update own listings" ON listings
  FOR UPDATE
  USING (directory_slug = get_directory_slug())
  WITH CHECK (directory_slug = get_directory_slug());

-- Providers table policies
CREATE POLICY "Providers are viewable by directory" ON providers
  FOR SELECT
  USING (directory_slug = get_directory_slug() OR get_directory_slug() IS NULL);

CREATE POLICY "Users can become providers" ON providers
  FOR INSERT
  WITH CHECK (directory_slug = get_directory_slug());

CREATE POLICY "Providers can update own profile" ON providers
  FOR UPDATE
  USING (directory_slug = get_directory_slug())
  WITH CHECK (directory_slug = get_directory_slug());

-- Reviews table policies
CREATE POLICY "Reviews are viewable by directory" ON reviews
  FOR SELECT
  USING (directory_slug = get_directory_slug() OR get_directory_slug() IS NULL);

CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT
  WITH CHECK (directory_slug = get_directory_slug());

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE
  USING (directory_slug = get_directory_slug())
  WITH CHECK (directory_slug = get_directory_slug());
