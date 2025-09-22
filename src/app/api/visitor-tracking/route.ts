import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { UAParser } from 'ua-parser-js';

// Check if tracking should be excluded (admin pages, admin clicks, etc.)
function shouldExcludeTracking(action: string, data: any): boolean {
  // Exclude admin page views
  if (action === 'page_view' && data.pageUrl && data.pageUrl.includes('/admin')) {
    return true;
  }
  
  // Exclude admin clicks
  if (action === 'click' && data.page && data.page.includes('/admin')) {
    return true;
  }
  
  // Exclude admin-related elements
  if (action === 'click' && data.element) {
    const adminElements = [
      'password', 'Access Dashboard', 'Refresh Real Data', '🔄 Refresh Data',
      'Loading real visitor data...', '🌍Locations', '🖱️Clicks', '📱Devices', '📊Overview'
    ];
    if (adminElements.some(element => data.element.includes(element))) {
      return true;
    }
  }
  
  return false;
}

// Get location information from IP address
async function getLocationFromIP(ip: string) {
  try {
    // Skip localhost and private IPs
    if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
      return {
        country: 'Local',
        city: 'Local',
        region: 'Local'
      };
    }

    // Use a free IP geolocation service (in production, use a paid service for better accuracy)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,regionName,city,timezone`);
    const data = await response.json();
    
    return {
      country: data.country || 'Unknown',
      city: data.city || 'Unknown',
      region: data.regionName || 'Unknown',
      timezone: data.timezone || 'Unknown'
    };
  } catch (error) {
    console.error('Error getting location:', error);
    return {
      country: 'Unknown',
      city: 'Unknown',
      region: 'Unknown'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, sessionId, session_id, ...data } = body;
    
    // Handle both sessionId and session_id for backward compatibility
    const actualSessionId = sessionId || session_id;

    if (!action || !actualSessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if this tracking should be excluded (admin pages, admin clicks, etc.)
    if (shouldExcludeTracking(action, data)) {
      return NextResponse.json({
        success: true,
        message: 'Tracking excluded (admin activity)'
      });
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Get client IP and user agent
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Parse device and browser information
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();
    
    // Get location information (simplified - in production you'd use a proper geolocation service)
    const locationInfo = await getLocationFromIP(clientIP);

    switch (action) {
      case 'page_view':
        await handlePageView(supabase, actualSessionId, clientIP, userAgent, data, deviceInfo, locationInfo);
        break;
      
      case 'click':
        await handleClick(supabase, actualSessionId, data);
        break;
      
      case 'activity':
        await handleActivity(supabase, actualSessionId);
        break;
      
      case 'heartbeat':
        await handleHeartbeat(supabase, actualSessionId, clientIP, userAgent, data, deviceInfo, locationInfo);
        break;
      
      case 'activity_update':
        await handleActivityUpdate(supabase, actualSessionId, data);
        break;
      
      case 'session_end':
        await handleSessionEnd(supabase, actualSessionId, data);
        break;
      
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Tracking data recorded'
    });

  } catch (error) {
    console.error('Error in visitor tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record tracking data' },
      { status: 500 }
    );
  }
}

async function handlePageView(supabase: any, sessionId: string, clientIP: string, userAgent: string, data: any, deviceInfo?: any, locationInfo?: any) {
  try {
    // Check if session exists
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('id')
      .eq('session_id', sessionId)
      .single();

    if (!existingSession) {
      // Create new session
      await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          ip_address: clientIP,
          user_agent: userAgent,
          country: locationInfo?.country || 'Unknown',
          city: locationInfo?.city || 'Unknown',
          landing_page: data.pageUrl,
          referrer: data.referrer
        });
    } else {
      // Update last activity
      await supabase
        .from('visitor_sessions')
        .update({ last_activity: new Date().toISOString() })
        .eq('session_id', sessionId);
    }

    // Record page view
    await supabase
      .from('page_views')
      .insert({
        session_id: sessionId,
        page_url: data.pageUrl,
        page_title: data.pageTitle,
        referrer: data.referrer
      });

  } catch (error) {
    console.error('Error handling page view:', error);
  }
}

async function handleClick(supabase: any, sessionId: string, data: any) {
  try {
    await supabase
      .from('click_tracking')
      .insert({
        session_id: sessionId,
        element_id: data.elementId,
        element_class: data.elementClass,
        element_text: data.elementText,
        page_url: data.pageUrl,
        click_position_x: data.clickX,
        click_position_y: data.clickY
      });

  } catch (error) {
    console.error('Error handling click:', error);
  }
}

async function handleActivity(supabase: any, sessionId: string) {
  try {
    await supabase
      .from('visitor_sessions')
      .update({ last_activity: new Date().toISOString() })
      .eq('session_id', sessionId);

  } catch (error) {
    console.error('Error handling activity:', error);
  }
}

// Handle heartbeat to keep session alive
async function handleHeartbeat(supabase: any, sessionId: string, clientIP: string, userAgent: string, data: any, deviceInfo?: any, locationInfo?: any) {
  try {
    // First try to update existing session
    const { data: existingSession, error: updateError } = await supabase
      .from('visitor_sessions')
      .update({
        last_activity: new Date().toISOString(),
        is_active: true
      })
      .eq('session_id', sessionId)
      .select();

    // If no existing session found, create a new one
    if (!existingSession || existingSession.length === 0) {
      const { error: insertError } = await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          ip_address: clientIP,
          user_agent: userAgent,
          country: locationInfo?.country || 'Unknown',
          city: locationInfo?.city || 'Unknown',
          last_activity: new Date().toISOString(),
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating session:', insertError);
      }
    } else if (updateError) {
      console.error('Error updating session:', updateError);
    }
  } catch (error) {
    console.error('Error handling heartbeat:', error);
  }
}

// Handle activity update
async function handleActivityUpdate(supabase: any, sessionId: string, data: any) {
  try {
    await supabase
      .from('visitor_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        is_active: true
      })
      .eq('session_id', sessionId);

  } catch (error) {
    console.error('Error handling activity update:', error);
  }
}

// Handle session end (user left)
async function handleSessionEnd(supabase: any, sessionId: string, data: any) {
  try {
    await supabase
      .from('visitor_sessions')
      .update({ 
        last_activity: new Date().toISOString(),
        is_active: false
      })
      .eq('session_id', sessionId);

  } catch (error) {
    console.error('Error handling session end:', error);
  }
}
