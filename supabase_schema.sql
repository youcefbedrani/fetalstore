-- Supabase SQL Schema for Ultrasound Orb Orders
-- Run this in your Supabase SQL Editor

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    wilaya VARCHAR(10) NOT NULL,
    baladia VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    child_name VARCHAR(255) NOT NULL,
    cod BOOLEAN DEFAULT true,
    quantity INTEGER DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    product_name VARCHAR(255) NOT NULL DEFAULT 'كرة الموجات فوق الصوتية',
    product_image VARCHAR(255),
    image_path VARCHAR(500),
    image_url VARCHAR(500),
    status VARCHAR(50) DEFAULT 'pending_cod',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Note: Using Cloudinary for image storage instead of Supabase storage
-- Cloudinary provides better image optimization and CDN delivery

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_wilaya ON orders(wilaya);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data (optional)
INSERT INTO orders (
    name, 
    phone, 
    wilaya, 
    baladia, 
    address, 
    child_name,
    cod, 
    quantity, 
    total_price, 
    product_name, 
    product_image, 
    image_path,
    image_url,
    status
) VALUES (
    'فاطمة أحمد',
    '+213555123456',
    '16',
    'الجزائر الوسطى',
    'شارع الأمير عبد القادر، رقم 15',
    'أحمد',
    true,
    1,
    3500.00,
    'كرة الموجات فوق الصوتية',
    '/2.png',
    'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/ultrasound-orb-orders/sample-image',
    'https://res.cloudinary.com/your-cloud/image/upload/w_400,h_400,q_auto,f_auto/ultrasound-orb-orders/sample-image',
    'pending_cod'
);

-- Create view for order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    id,
    name,
    phone,
    wilaya,
    baladia,
    quantity,
    total_price,
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
    END as status_arabic
FROM orders
ORDER BY created_at DESC;

-- Create IP tracking table for rate limiting
CREATE TABLE IF NOT EXISTS ip_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    order_count INTEGER DEFAULT 0,
    first_order_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_order_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_blocked BOOLEAN DEFAULT false,
    blocked_at TIMESTAMP WITH TIME ZONE,
    blocked_reason VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(ip_address)
);

-- Create blocked IPs table for Cloudflare integration
CREATE TABLE IF NOT EXISTS blocked_ips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address INET NOT NULL,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    blocked_by VARCHAR(100) DEFAULT 'system',
    reason VARCHAR(255) NOT NULL,
    cloudflare_rule_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    unblocked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add IP address column to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS client_ip INET;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_agent TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cloudflare_country VARCHAR(2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS cloudflare_ray_id VARCHAR(255);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ip_tracking_ip_address ON ip_tracking(ip_address);
CREATE INDEX IF NOT EXISTS idx_ip_tracking_blocked ON ip_tracking(is_blocked);
CREATE INDEX IF NOT EXISTS idx_ip_tracking_last_order ON ip_tracking(last_order_at);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_ip_address ON blocked_ips(ip_address);
CREATE INDEX IF NOT EXISTS idx_blocked_ips_active ON blocked_ips(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_client_ip ON orders(client_ip);

-- Create function to check and update IP rate limits
CREATE OR REPLACE FUNCTION check_ip_rate_limit(ip_addr INET)
RETURNS JSON AS $$
DECLARE
    ip_record RECORD;
    current_time TIMESTAMP WITH TIME ZONE := NOW();
    time_diff INTERVAL;
BEGIN
    -- Get or create IP record
    SELECT * INTO ip_record FROM ip_tracking WHERE ip_address = ip_addr;
    
    IF ip_record IS NULL THEN
        -- First time IP, create record
        INSERT INTO ip_tracking (ip_address, order_count, first_order_at, last_order_at)
        VALUES (ip_addr, 1, current_time, current_time);
        
        RETURN json_build_object(
            'allowed', true,
            'order_count', 1,
            'remaining', 2,
            'reset_time', current_time + INTERVAL '24 hours'
        );
    ELSE
        -- Check if IP is blocked
        IF ip_record.is_blocked THEN
            RETURN json_build_object(
                'allowed', false,
                'reason', 'IP is blocked',
                'blocked_at', ip_record.blocked_at,
                'blocked_reason', ip_record.blocked_reason
            );
        END IF;
        
        -- Check if 24 hours have passed since first order
        time_diff := current_time - ip_record.first_order_at;
        
        IF time_diff >= INTERVAL '24 hours' THEN
            -- Reset counter
            UPDATE ip_tracking 
            SET order_count = 1, 
                first_order_at = current_time, 
                last_order_at = current_time,
                updated_at = current_time
            WHERE ip_address = ip_addr;
            
            RETURN json_build_object(
                'allowed', true,
                'order_count', 1,
                'remaining', 2,
                'reset_time', current_time + INTERVAL '24 hours'
            );
        ELSE
            -- Check if limit exceeded
            IF ip_record.order_count >= 3 THEN
                -- Block IP
                UPDATE ip_tracking 
                SET is_blocked = true, 
                    blocked_at = current_time,
                    blocked_reason = 'Rate limit exceeded (3 orders in 24h)',
                    updated_at = current_time
                WHERE ip_address = ip_addr;
                
                -- Add to blocked IPs table
                INSERT INTO blocked_ips (ip_address, reason, blocked_by)
                VALUES (ip_addr, 'Rate limit exceeded (3 orders in 24h)', 'system');
                
                RETURN json_build_object(
                    'allowed', false,
                    'reason', 'Rate limit exceeded',
                    'order_count', ip_record.order_count,
                    'blocked_at', current_time
                );
            ELSE
                -- Increment counter
                UPDATE ip_tracking 
                SET order_count = order_count + 1, 
                    last_order_at = current_time,
                    updated_at = current_time
                WHERE ip_address = ip_addr;
                
                RETURN json_build_object(
                    'allowed', true,
                    'order_count', ip_record.order_count + 1,
                    'remaining', 3 - (ip_record.order_count + 1),
                    'reset_time', ip_record.first_order_at + INTERVAL '24 hours'
                );
            END IF;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to reset IP limits (admin function)
CREATE OR REPLACE FUNCTION reset_ip_limits(ip_addr INET)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE ip_tracking 
    SET order_count = 0, 
        is_blocked = false, 
        blocked_at = NULL, 
        blocked_reason = NULL,
        first_order_at = NOW(),
        last_order_at = NOW(),
        updated_at = NOW()
    WHERE ip_address = ip_addr;
    
    -- Also unblock in blocked_ips table
    UPDATE blocked_ips 
    SET is_active = false, 
        unblocked_at = NOW()
    WHERE ip_address = ip_addr AND is_active = true;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to get IP statistics
CREATE OR REPLACE FUNCTION get_ip_statistics()
RETURNS JSON AS $$
DECLARE
    total_ips INTEGER;
    blocked_ips INTEGER;
    recent_orders INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_ips FROM ip_tracking;
    SELECT COUNT(*) INTO blocked_ips FROM ip_tracking WHERE is_blocked = true;
    SELECT COUNT(*) INTO recent_orders FROM orders WHERE created_at >= NOW() - INTERVAL '24 hours';
    
    RETURN json_build_object(
        'total_ips', total_ips,
        'blocked_ips', blocked_ips,
        'recent_orders_24h', recent_orders,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_summary TO authenticated;
GRANT ALL ON ip_tracking TO authenticated;
GRANT ALL ON blocked_ips TO authenticated;
GRANT SELECT ON orders TO anon;
GRANT SELECT ON order_summary TO anon;
GRANT EXECUTE ON FUNCTION check_ip_rate_limit TO anon;
GRANT EXECUTE ON FUNCTION reset_ip_limits TO authenticated;
GRANT EXECUTE ON FUNCTION get_ip_statistics TO authenticated;
