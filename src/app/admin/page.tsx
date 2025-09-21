'use client';

import { useState, useEffect } from 'react';

interface IPStats {
  total_ips: number;
  blocked_ips: number;
  recent_orders_24h: number;
  timestamp: string;
}

interface BlockedIP {
  id: string;
  ip_address: string;
  blocked_at: string;
  reason: string;
  blocked_by: string;
  is_active: boolean;
}

interface IPTrackingRecord {
  id: string;
  ip_address: string;
  order_count: number;
  first_order_at: string;
  last_order_at: string;
  is_blocked: boolean;
  blocked_at?: string;
  blocked_reason?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<IPStats | null>(null);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [trackingRecords, setTrackingRecords] = useState<IPTrackingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const adminToken = process.env.NEXT_PUBLIC_ADMIN_TOKEN || 'your-admin-token';

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch statistics
      const statsResponse = await fetch('/api/admin/ip-management?action=stats', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      const statsData = await statsResponse.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch blocked IPs
      const blockedResponse = await fetch('/api/admin/ip-management?action=blocked&limit=20', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      const blockedData = await blockedResponse.json();
      if (blockedData.success) {
        setBlockedIPs(blockedData.data);
      }

      // Fetch tracking records
      const trackingResponse = await fetch('/api/admin/ip-management?action=tracking&limit=20', {
        headers: {
          'Authorization': `Bearer ${adminToken}`,
        },
      });
      const trackingData = await trackingResponse.json();
      if (trackingData.success) {
        setTrackingRecords(trackingData.data);
      }

    } catch (err) {
      setError('Failed to fetch data');
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetLimits = async (ip: string) => {
    try {
      setActionLoading(ip);
      const response = await fetch('/api/admin/ip-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'reset_limits',
          ip,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`IP limits reset for ${ip}`);
        fetchData(); // Refresh data
      } else {
        alert(`Failed to reset limits: ${data.error}`);
      }
    } catch (err) {
      alert('Error resetting limits');
      console.error('Error resetting limits:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (ip: string) => {
    try {
      setActionLoading(ip);
      const response = await fetch('/api/admin/ip-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          action: 'unblock',
          ip,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`IP ${ip} has been unblocked`);
        fetchData(); // Refresh data
      } else {
        alert(`Failed to unblock: ${data.error}`);
      }
    } catch (err) {
      alert('Error unblocking IP');
      console.error('Error unblocking IP:', err);
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">IP Management and Order Monitoring</p>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total IPs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.total_ips}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Blocked IPs</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.blocked_ips}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Orders (24h)</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.recent_orders_24h}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Blocked IPs */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">Blocked IPs</h2>
            </div>
            <div className="p-6">
              {blockedIPs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No blocked IPs</p>
              ) : (
                <div className="space-y-4">
                  {blockedIPs.map((ip) => (
                    <div key={ip.id} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{ip.ip_address}</p>
                        <p className="text-sm text-gray-600">{ip.reason}</p>
                        <p className="text-xs text-gray-500">
                          Blocked: {new Date(ip.blocked_at).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnblock(ip.ip_address)}
                        disabled={actionLoading === ip.ip_address}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                      >
                        {actionLoading === ip.ip_address ? 'Unblocking...' : 'Unblock'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* IP Tracking Records */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">IP Tracking Records</h2>
            </div>
            <div className="p-6">
              {trackingRecords.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tracking records</p>
              ) : (
                <div className="space-y-4">
                  {trackingRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{record.ip_address}</p>
                        <p className="text-sm text-gray-600">
                          Orders: {record.order_count} | 
                          Last: {new Date(record.last_order_at).toLocaleString()}
                        </p>
                        {record.is_blocked && (
                          <p className="text-xs text-red-600">
                            Blocked: {record.blocked_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {record.is_blocked && (
                          <button
                            onClick={() => handleUnblock(record.ip_address)}
                            disabled={actionLoading === record.ip_address}
                            className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50"
                          >
                            {actionLoading === record.ip_address ? 'Unblocking...' : 'Unblock'}
                          </button>
                        )}
                        <button
                          onClick={() => handleResetLimits(record.ip_address)}
                          disabled={actionLoading === record.ip_address}
                          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 disabled:opacity-50"
                        >
                          {actionLoading === record.ip_address ? 'Resetting...' : 'Reset'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchData}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
