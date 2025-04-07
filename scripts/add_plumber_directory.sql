-- Add a test plumber directory to verify multi-tenant capabilities
-- This script demonstrates how to add a new directory to the platform
-- without making code changes - just data configuration in Supabase

INSERT INTO public.directories (
  name,
  directory_slug,
  domain,
  description,
  icon_name,
  brand_color_primary,
  brand_color_secondary,
  brand_color_accent,
  features,
  is_public,
  is_searchable,
  is_active,
  priority
) VALUES (
  'Plumber Finder Now',
  'plumberfindernow',
  'plumberfindernow.com',
  'Find qualified plumbers in your area',
  'Wrench',
  '#0284c7', -- blue-600
  '#0369a1', -- blue-700
  '#ea580c', -- orange-600
  ARRAY['plumber_search']::TEXT[],
  true,
  true,
  true,
  20
);

-- Display the newly created directory to verify
SELECT * FROM public.directories WHERE directory_slug = 'plumberfindernow';
