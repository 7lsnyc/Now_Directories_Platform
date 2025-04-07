-- Function to add features column to directories table
CREATE OR REPLACE FUNCTION public.add_features_column()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
   -- First check if the column exists
   IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'directories'
      AND column_name = 'features'
   ) THEN
      -- Add the column if it doesn't exist
      EXECUTE 'ALTER TABLE public.directories ADD COLUMN features TEXT[] DEFAULT ARRAY[]::TEXT[];';
   END IF;
END;
$$;
