-- SQL command to add child_name column to existing orders table
-- Run this in your Supabase SQL Editor if you already have an existing orders table

-- Add child_name column to existing orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS child_name VARCHAR(255);

-- Update existing records to have a default child name (optional)
-- You can modify this or skip it if you want to keep existing records as is
UPDATE orders 
SET child_name = 'غير محدد' 
WHERE child_name IS NULL OR child_name = '';

-- Make child_name NOT NULL after updating existing records
ALTER TABLE orders ALTER COLUMN child_name SET NOT NULL;

-- Add comment to the column
COMMENT ON COLUMN orders.child_name IS 'اسم الطفل المطلوب نقشه على الكرة';

-- Create index for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_orders_child_name ON orders(child_name);
