import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

// Simple admin authentication
function isAdminAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_SECRET_TOKEN;
  
  if (!authHeader || !adminToken) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === adminToken;
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Manual cleanup: Mark sessions as inactive if no activity in last 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data: cleanupResult, error } = await supabase
      .from('visitor_sessions')
      .update({ is_active: false })
      .lt('last_activity', threeMinutesAgo)
      .eq('is_active', true)
      .select('session_id');
    
    if (error) {
      console.error('Cleanup error:', error);
      return NextResponse.json(
        { success: false, error: 'Cleanup failed' },
        { status: 500 }
      );
    }

    // Get updated statistics
    const { data: statsData } = await supabase.rpc('get_visitor_statistics');

    return NextResponse.json({
      success: true,
      data: {
        sessions_cleaned: cleanupResult,
        current_stats: statsData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
