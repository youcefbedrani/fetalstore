-- Quick fix for missing columns in Supabase orders table
-- Run this in your Supabase SQL Editor

-- Add the missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS child_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_path VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Set default value for existing records
UPDATE orders SET child_name = 'غير محدد' WHERE child_name IS NULL;

-- Make child_name required
ALTER TABLE orders ALTER COLUMN child_name SET NOT NULL;
