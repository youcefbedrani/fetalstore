-- Visitor Analytics Database Schema
-- Add these tables to your Supabase database for comprehensive visitor tracking

-- Create visitor sessions table
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    ip_address INET NOT NULL,
    user_agent TEXT,
    country VARCHAR(2),
    city VARCHAR(100),
    referrer TEXT,
    landing_page TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create page views table
CREATE TABLE IF NOT EXISTS page_views (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    referrer TEXT,
    view_duration INTEGER DEFAULT 0, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create click tracking table
CREATE TABLE IF NOT EXISTS click_tracking (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    element_id VARCHAR(255),
    element_class VARCHAR(255),
    element_text TEXT,
    page_url TEXT NOT NULL,
    click_position_x INTEGER,
    click_position_y INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create visitor events table
CREATE TABLE IF NOT EXISTS visitor_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL, -- 'page_view', 'click', 'scroll', 'form_submit', etc.
    event_data JSONB,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_ip ON visitor_sessions(ip_address);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_active ON visitor_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created ON visitor_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_url ON page_views(page_url);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_click_tracking_session ON click_tracking(session_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_page ON click_tracking(page_url);
CREATE INDEX IF NOT EXISTS idx_click_tracking_created ON click_tracking(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_events_session ON visitor_events(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_events_type ON visitor_events(event_type);
CREATE INDEX IF NOT EXISTS idx_visitor_events_created ON visitor_events(created_at);

-- Create function to get visitor statistics
CREATE OR REPLACE FUNCTION get_visitor_statistics()
RETURNS JSON AS $$
DECLARE
    total_visitors INTEGER;
    current_online INTEGER;
    page_views_today INTEGER;
    unique_visitors_today INTEGER;
    five_minutes_ago TIMESTAMP WITH TIME ZONE;
    today_start TIMESTAMP WITH TIME ZONE;
BEGIN
    five_minutes_ago := NOW() - INTERVAL '5 minutes';
    today_start := DATE_TRUNC('day', NOW());
    
    -- Get total unique visitors
    SELECT COUNT(DISTINCT ip_address) INTO total_visitors FROM visitor_sessions;
    
    -- Get current online users (active in last 2 minutes AND marked as active)
    SELECT COUNT(DISTINCT ip_address) INTO current_online 
    FROM visitor_sessions 
    WHERE last_activity >= (NOW() - INTERVAL '2 minutes') AND is_active = true;
    
    -- Get page views today
    SELECT COUNT(*) INTO page_views_today 
    FROM page_views 
    WHERE created_at >= today_start;
    
    -- Get unique visitors today
    SELECT COUNT(DISTINCT session_id) INTO unique_visitors_today 
    FROM visitor_sessions 
    WHERE created_at >= today_start;
    
    RETURN json_build_object(
        'total_visitors', total_visitors,
        'current_online', current_online,
        'page_views_today', page_views_today,
        'unique_visitors_today', unique_visitors_today,
        'timestamp', NOW()
    );
END;
$$ LANGUAGE plpgsql;

-- Create function to get top pages
CREATE OR REPLACE FUNCTION get_top_pages(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    page_url TEXT,
    views BIGINT,
    unique_visitors BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.page_url,
        COUNT(*) as views,
        COUNT(DISTINCT pv.session_id) as unique_visitors
    FROM page_views pv
    WHERE pv.created_at >= DATE_TRUNC('day', NOW())
    GROUP BY pv.page_url
    ORDER BY views DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get click analytics
CREATE OR REPLACE FUNCTION get_click_analytics(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    element_id VARCHAR(255),
    element_text TEXT,
    page_url TEXT,
    clicks BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ct.element_id,
        ct.element_text,
        ct.page_url,
        COUNT(*) as clicks
    FROM click_tracking ct
    WHERE ct.created_at >= DATE_TRUNC('day', NOW())
    GROUP BY ct.element_id, ct.element_text, ct.page_url
    ORDER BY clicks DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get visitor locations
CREATE OR REPLACE FUNCTION get_visitor_locations(limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
    country VARCHAR(2),
    visitors BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        vs.country,
        COUNT(DISTINCT vs.ip_address) as visitors
    FROM visitor_sessions vs
    WHERE vs.created_at >= DATE_TRUNC('day', NOW())
    AND vs.country IS NOT NULL
    GROUP BY vs.country
    ORDER BY visitors DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to get hourly visits
CREATE OR REPLACE FUNCTION get_hourly_visits()
RETURNS TABLE(
    hour INTEGER,
    visitors BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM created_at)::INTEGER as hour,
        COUNT(DISTINCT ip_address) as visitors
    FROM visitor_sessions
    WHERE created_at >= DATE_TRUNC('day', NOW())
    GROUP BY EXTRACT(HOUR FROM created_at)
    ORDER BY hour;
END;
$$ LANGUAGE plpgsql;

-- Create function to cleanup inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Mark sessions as inactive if no activity in last 5 minutes
    UPDATE visitor_sessions 
    SET is_active = false 
    WHERE last_activity < (NOW() - INTERVAL '5 minutes') 
    AND is_active = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT ALL ON visitor_sessions TO authenticated;
GRANT ALL ON page_views TO authenticated;
GRANT ALL ON click_tracking TO authenticated;
GRANT ALL ON visitor_events TO authenticated;
GRANT SELECT ON visitor_sessions TO anon;
GRANT SELECT ON page_views TO anon;
GRANT SELECT ON click_tracking TO anon;
GRANT SELECT ON visitor_events TO anon;
GRANT EXECUTE ON FUNCTION get_visitor_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION get_top_pages TO authenticated;
GRANT EXECUTE ON FUNCTION get_click_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_visitor_locations TO authenticated;
GRANT EXECUTE ON FUNCTION get_hourly_visits TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_inactive_sessions TO authenticated;
