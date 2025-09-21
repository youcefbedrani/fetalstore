-- SQL commands to update existing Supabase database
-- Run these commands in your Supabase SQL Editor

-- Add missing columns to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS child_name VARCHAR(255);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_path VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- Update existing records to have default values for new columns
UPDATE orders 
SET child_name = 'غير محدد' 
WHERE child_name IS NULL OR child_name = '';

-- Make child_name NOT NULL after updating existing records
ALTER TABLE orders ALTER COLUMN child_name SET NOT NULL;

-- Add comments to the new columns
COMMENT ON COLUMN orders.child_name IS 'اسم الطفل المطلوب نقشه على الكرة';
COMMENT ON COLUMN orders.image_path IS 'مسار الصورة في Cloudinary';
COMMENT ON COLUMN orders.image_url IS 'رابط الصورة المحسن من Cloudinary';

-- Create indexes for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_orders_child_name ON orders(child_name);
CREATE INDEX IF NOT EXISTS idx_orders_image_url ON orders(image_url);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;
