-- Fix Supabase Database Schema for Cloudinary Integration
-- Run this in your Supabase SQL Editor

-- Step 1: Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS child_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_path VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Step 2: Update existing records with default values
UPDATE orders 
SET child_name = 'غير محدد' 
WHERE child_name IS NULL OR child_name = '';

-- Step 3: Make child_name required (NOT NULL)
ALTER TABLE orders ALTER COLUMN child_name SET NOT NULL;

-- Step 4: Add helpful comments
COMMENT ON COLUMN orders.child_name IS 'اسم الطفل المطلوب نقشه على الكرة';
COMMENT ON COLUMN orders.image_path IS 'مسار الصورة الأصلي في Cloudinary';
COMMENT ON COLUMN orders.image_url IS 'رابط الصورة المحسن من Cloudinary للعرض';

-- Step 5: Verify the table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
