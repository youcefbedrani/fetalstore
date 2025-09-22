-- Apply the updated visitor analytics schema
-- This includes the improved online user detection and cleanup function

-- Update the get_visitor_statistics function to use stricter online detection
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

-- Create function to cleanup inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    -- Mark sessions as inactive if no activity in last 3 minutes
    UPDATE visitor_sessions 
    SET is_active = false 
    WHERE last_activity < (NOW() - INTERVAL '3 minutes') 
    AND is_active = true;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION cleanup_inactive_sessions TO authenticated;
