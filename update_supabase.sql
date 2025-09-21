-- SQL to update your existing Supabase database for Cloudinary integration
-- Run these commands in your Supabase SQL Editor

-- 1. Add the new image_url column to store optimized Cloudinary URLs
ALTER TABLE orders ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);

-- 2. Update the image_path column to allow longer URLs (Cloudinary URLs can be long)
ALTER TABLE orders ALTER COLUMN image_path TYPE VARCHAR(500);

-- 3. Add an index on the new image_url column for better performance
CREATE INDEX IF NOT EXISTS idx_orders_image_url ON orders(image_url);

-- 4. Update existing records to have image_url (if you have existing data)
-- This will copy the image_path to image_url for existing records
UPDATE orders 
SET image_url = image_path 
WHERE image_url IS NULL AND image_path IS NOT NULL;

-- 5. Optional: Add a comment to document the new columns
COMMENT ON COLUMN orders.image_path IS 'Full Cloudinary URL of the uploaded image';
COMMENT ON COLUMN orders.image_url IS 'Optimized Cloudinary URL for display (400x400, auto quality)';

-- 6. Create a view to show order summary with image information
CREATE OR REPLACE VIEW order_summary_with_images AS
SELECT 
    id,
    name,
    phone,
    wilaya,
    baladia,
    quantity,
    total_price,
    product_name,
    product_image,
    image_path,
    image_url,
    status,
    created_at,
    CASE 
        WHEN status = 'pending_cod' THEN 'في انتظار الدفع عند الاستلام'
        WHEN status = 'pending' THEN 'في الانتظار'
        WHEN status = 'processing' THEN 'قيد المعالجة'
        WHEN status = 'shipped' THEN 'تم الشحن'
        WHEN status = 'delivered' THEN 'تم التسليم'
        WHEN status = 'cancelled' THEN 'ملغي'
        ELSE status
    END as status_arabic,
    CASE 
        WHEN image_url IS NOT NULL THEN 'Cloudinary'
        WHEN image_path IS NOT NULL THEN 'Legacy'
        ELSE 'No Image'
    END as image_storage_type
FROM orders
ORDER BY created_at DESC;

-- 7. Grant permissions for the new view
GRANT SELECT ON order_summary_with_images TO authenticated;
GRANT SELECT ON order_summary_with_images TO anon;

-- 8. Optional: Add a function to get optimized image URL
CREATE OR REPLACE FUNCTION get_optimized_image_url(
    cloudinary_url TEXT,
    width INTEGER DEFAULT 400,
    height INTEGER DEFAULT 400,
    quality TEXT DEFAULT 'auto'
)
RETURNS TEXT AS $$
BEGIN
    -- If it's not a Cloudinary URL, return as is
    IF cloudinary_url IS NULL OR cloudinary_url NOT LIKE '%cloudinary.com%' THEN
        RETURN cloudinary_url;
    END IF;
    
    -- Extract the base URL and image path
    DECLARE
        base_url TEXT;
        image_path TEXT;
        optimized_url TEXT;
    BEGIN
        base_url := split_part(cloudinary_url, '/upload/', 1);
        image_path := split_part(cloudinary_url, '/upload/', 2);
        
        -- Build optimized URL
        optimized_url := base_url || '/upload/w_' || width || ',h_' || height || ',q_' || quality || ',f_auto,c_limit/' || image_path;
        
        RETURN optimized_url;
    END;
END;
$$ LANGUAGE plpgsql;

-- 9. Test the function (optional)
-- SELECT get_optimized_image_url('https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ultrasound-orb-orders/sample.jpg', 200, 200, '80');

-- 10. Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 11. Create the trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Verify the changes
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('image_path', 'image_url')
ORDER BY column_name;

-- 13. Check if the view was created successfully
SELECT * FROM order_summary_with_images LIMIT 1;
