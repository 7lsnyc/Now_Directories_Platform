-- Migration script for directories table

-- 1. Update directory slug from 'notary' to 'notaryfindernow'
UPDATE public.directories
SET directory_slug = 'notaryfindernow'
WHERE directory_slug = 'notary';

-- 2. Add features column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'directories'
        AND column_name = 'features'
    ) THEN
        -- Add the column if it doesn't exist
        ALTER TABLE public.directories ADD COLUMN features TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
END $$;

-- 3. Update the notaryfindernow record with relevant features
UPDATE public.directories
SET features = ARRAY['notary_search', 'mobile_notary_filter']::TEXT[]
WHERE directory_slug = 'notaryfindernow';

-- 4. Show the updated record 
SELECT * FROM public.directories WHERE directory_slug = 'notaryfindernow';
