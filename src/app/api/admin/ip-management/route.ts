import { NextRequest, NextResponse } from 'next/server';
import { 
  getIPStatistics, 
  getBlockedIPs, 
  getIPTrackingRecords, 
  resetIPLimits 
} from '@/lib/ip-tracking';
import { unblockIPWithCloudflare } from '@/lib/cloudflare';

// Simple admin authentication (you should implement proper JWT auth)
function isAdminAuthenticated(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const adminToken = process.env.ADMIN_SECRET_TOKEN;
  
  if (!authHeader || !adminToken) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return token === adminToken;
}

// Get IP statistics
export async function GET(request: NextRequest) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'stats';

    switch (action) {
      case 'stats':
        const stats = await getIPStatistics();
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'blocked':
        const limit = parseInt(url.searchParams.get('limit') || '50');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const blockedIPs = await getBlockedIPs(limit, offset);
        return NextResponse.json({
          success: true,
          data: blockedIPs,
          pagination: { limit, offset }
        });

      case 'tracking':
        const trackingLimit = parseInt(url.searchParams.get('limit') || '50');
        const trackingOffset = parseInt(url.searchParams.get('offset') || '0');
        const trackingRecords = await getIPTrackingRecords(trackingLimit, trackingOffset);
        return NextResponse.json({
          success: true,
          data: trackingRecords,
          pagination: { limit: trackingLimit, offset: trackingOffset }
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in admin IP management GET:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Reset IP limits or unblock IPs
export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthenticated(request)) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ip } = body;

    if (!action || !ip) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'reset_limits':
        const resetSuccess = await resetIPLimits(ip);
        if (resetSuccess) {
          return NextResponse.json({
            success: true,
            message: `IP limits reset for ${ip}`
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to reset IP limits' },
            { status: 500 }
          );
        }

      case 'unblock':
        const unblockSuccess = await unblockIPWithCloudflare(ip);
        if (unblockSuccess) {
          return NextResponse.json({
            success: true,
            message: `IP ${ip} has been unblocked`
          });
        } else {
          return NextResponse.json(
            { success: false, error: 'Failed to unblock IP' },
            { status: 500 }
          );
        }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error in admin IP management POST:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
