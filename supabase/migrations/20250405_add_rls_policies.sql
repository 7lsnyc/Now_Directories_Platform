-- Create RLS policies for multi-tenant data isolation

-- Profiles table policies
CREATE POLICY "read profiles for matching slug" ON profiles
  FOR SELECT
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "insert profiles with matching slug" ON profiles
  FOR INSERT
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "update profiles with matching slug" ON profiles
  FOR UPDATE
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text)
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

-- Listings table policies
CREATE POLICY "read listings for matching slug" ON listings
  FOR SELECT
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "insert listings with matching slug" ON listings
  FOR INSERT
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "update listings with matching slug" ON listings
  FOR UPDATE
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text)
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

-- Providers table policies
CREATE POLICY "read providers for matching slug" ON providers
  FOR SELECT
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "insert providers with matching slug" ON providers
  FOR INSERT
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "update providers with matching slug" ON providers
  FOR UPDATE
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text)
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

-- Reviews table policies
CREATE POLICY "read reviews for matching slug" ON reviews
  FOR SELECT
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "insert reviews with matching slug" ON reviews
  FOR INSERT
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

CREATE POLICY "update reviews with matching slug" ON reviews
  FOR UPDATE
  USING (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text)
  WITH CHECK (directory_slug = current_setting('request.jwt.claims.directory_slug', true)::text);

-- Add a policy for admin access (optional, for platform admins)
-- This would require an additional claim like 'is_platform_admin'
CREATE POLICY "platform admin access" ON profiles
  FOR ALL
  USING (current_setting('request.jwt.claims.is_platform_admin', true)::boolean = true);

CREATE POLICY "platform admin access" ON listings
  FOR ALL
  USING (current_setting('request.jwt.claims.is_platform_admin', true)::boolean = true);

CREATE POLICY "platform admin access" ON providers
  FOR ALL
  USING (current_setting('request.jwt.claims.is_platform_admin', true)::boolean = true);

CREATE POLICY "platform admin access" ON reviews
  FOR ALL
  USING (current_setting('request.jwt.claims.is_platform_admin', true)::boolean = true);
