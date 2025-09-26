'use client';

import { useEffect, useState } from 'react';

interface DebugEvent {
  id: string;
  eventName: string;
  parameters: any;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

interface PixelDebuggerProps {
  isEnabled?: boolean;
  maxEvents?: number;
}

export default function PixelDebugger({ isEnabled = false, maxEvents = 10 }: PixelDebuggerProps) {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [isActive, setIsActive] = useState(isEnabled);
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pixelId, setPixelId] = useState<string>('');

  useEffect(() => {
    // Check pixel status
    const checkPixel = () => {
      if (typeof window !== 'undefined') {
        if ((window as any).fbq) {
          setPixelStatus('ready');
          setPixelId(process.env.NEXT_PUBLIC_META_PIXEL_ID || 'Not set');
        } else {
          setPixelStatus('error');
        }
      }
    };

    checkPixel();
    const timer = setTimeout(checkPixel, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isActive || typeof window === 'undefined') return;

    // Store original fbq function
    const originalFbq = (window as any).fbq;
    
    // Override fbq to capture events
    (window as any).fbq = function(...args: any[]) {
      const [eventName, parameters] = args;
      
      // Add event to our log
      const newEvent: DebugEvent = {
        id: Math.random().toString(36).substr(2, 9),
        eventName: eventName || 'Unknown',
        parameters: parameters || {},
        timestamp: new Date().toLocaleTimeString(),
        status: 'success'
      };
      
      setEvents(prev => [newEvent, ...prev.slice(0, maxEvents - 1)]);
      
      // Call original function
      return originalFbq.apply(this, args);
    };

    // Cleanup function
    return () => {
      if (originalFbq) {
        (window as any).fbq = originalFbq;
      }
    };
  }, [isActive, maxEvents]);

  const clearEvents = () => {
    setEvents([]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  // Don't render in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !isEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg max-w-md z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-gray-900 text-sm">Pixel Debugger</h3>
          <div className={`w-2 h-2 rounded-full ${
            pixelStatus === 'ready' ? 'bg-green-500' :
            pixelStatus === 'error' ? 'bg-red-500' :
            'bg-yellow-500'
          }`}></div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              isActive 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isActive ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={clearEvents}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Pixel Status */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="text-xs text-gray-600">
          <div>Status: <span className="font-medium">{pixelStatus}</span></div>
          <div>ID: <span className="font-mono">{pixelId}</span></div>
        </div>
      </div>

      {/* Events List */}
      {isActive && (
        <div className="max-h-64 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No events captured yet
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {events.map((event) => (
                <div key={event.id} className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1">
                      <span className="text-sm">{getStatusIcon(event.status)}</span>
                      <span className="font-medium text-sm text-gray-900">{event.eventName}</span>
                    </div>
                    <span className="text-xs text-gray-500">{event.timestamp}</span>
                  </div>
                  
                  {Object.keys(event.parameters).length > 0 && (
                    <div className="bg-gray-50 rounded p-2 mt-1">
                      <pre className="text-xs text-gray-700 overflow-x-auto">
                        {JSON.stringify(event.parameters, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-3 py-2 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </div>
          
          <div className="flex space-x-1">
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Events Manager
            </a>
            <span className="text-xs text-gray-400">•</span>
            <a
              href="https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Pixel Helper
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
