-- Essential SQL changes for Cloudinary integration
-- Run these commands in your Supabase SQL Editor

-- 1. Add the new image_url column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- 2. Update image_path column to allow longer URLs
ALTER TABLE orders ALTER COLUMN image_path TYPE VARCHAR(500);

-- 3. Update existing records (if any)
UPDATE orders 
SET image_url = image_path 
WHERE image_url IS NULL AND image_path IS NOT NULL;

-- 4. Verify the changes
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('image_path', 'image_url');
