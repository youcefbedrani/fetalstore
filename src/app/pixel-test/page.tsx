'use client';

import { useState, useEffect } from 'react';

export default function PixelTestPage() {
  const [events, setEvents] = useState<Array<{
    id: string;
    eventName: string;
    parameters: any;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
  }>>([]);
  
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [pixelId, setPixelId] = useState<string>('');

  useEffect(() => {
    // Check pixel status
    const checkPixel = () => {
      if (typeof window !== 'undefined') {
        if ((window as any).fbq) {
          setPixelStatus('ready');
          setPixelId('24528287270184892');
        } else {
          setPixelStatus('error');
        }
      }
    };

    // Check immediately and after a delay
    checkPixel();
    const timer = setTimeout(checkPixel, 2000);

    return () => clearTimeout(timer);
  }, []);

  const addEvent = (eventName: string, parameters: any, status: 'success' | 'error' | 'pending' = 'pending') => {
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      eventName,
      parameters,
      timestamp: new Date().toLocaleTimeString(),
      status
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events
  };

  const trackEvent = (eventName: string, parameters: any) => {
    addEvent(eventName, parameters, 'pending');
    
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', eventName, parameters);
        addEvent(eventName, parameters, 'success');
        console.log(`✅ Test event sent: ${eventName}`, parameters);
      } catch (error) {
        addEvent(eventName, parameters, 'error');
        console.error(`❌ Test event failed: ${eventName}`, error);
      }
    } else {
      addEvent(eventName, parameters, 'error');
      console.error('❌ Meta Pixel not available');
    }
  };

  const testEvents = {
    pageView: () => {
      trackEvent('PageView', {
        page_title: 'Pixel Test Page',
        page_location: window.location.href
      });
    },
    
    viewContent: () => {
      trackEvent('ViewContent', {
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        value: 5000,
        currency: 'DZD'
      });
    },
    
    addToCart: () => {
      trackEvent('AddToCart', {
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        value: 5000,
        currency: 'DZD',
        num_items: 1
      });
    },
    
    initiateCheckout: () => {
      trackEvent('InitiateCheckout', {
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        value: 5000,
        currency: 'DZD',
        num_items: 1
      });
    },
    
    purchase: () => {
      trackEvent('Purchase', {
        value: 5000,
        currency: 'DZD',
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        num_items: 1,
        order_id: `test_order_${Date.now()}`
      });
    },
    
    customEvent: () => {
      trackEvent('CustomEvent', {
        custom_parameter: 'test_value',
        timestamp: Date.now()
      });
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meta Pixel Test Center</h1>
          <p className="text-gray-600 mb-4">
            Test and verify your Meta Pixel events in real-time
          </p>
          
          {/* Pixel Status */}
          <div className="flex items-center space-x-4 mb-4">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              pixelStatus === 'ready' ? 'bg-green-100 text-green-800' :
              pixelStatus === 'error' ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {pixelStatus === 'ready' ? '✅ Pixel Ready' :
               pixelStatus === 'error' ? '❌ Pixel Error' :
               '⏳ Loading...'}
            </div>
            <div className="text-sm text-gray-600">
              Pixel ID: <span className="font-mono">{pixelId}</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Install <a href="https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc" target="_blank" rel="noopener noreferrer" className="underline">Meta Pixel Helper</a> browser extension</li>
              <li>2. Click the test buttons below to fire events</li>
              <li>3. Check Meta Pixel Helper to see if events appear</li>
              <li>4. Verify events in <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="underline">Facebook Events Manager</a></li>
            </ol>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Events</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={testEvents.pageView}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              PageView
            </button>
            
            <button
              onClick={testEvents.viewContent}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              ViewContent
            </button>
            
            <button
              onClick={testEvents.addToCart}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              AddToCart
            </button>
            
            <button
              onClick={testEvents.initiateCheckout}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              InitiateCheckout
            </button>
            
            <button
              onClick={testEvents.purchase}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Purchase
            </button>
            
            <button
              onClick={testEvents.customEvent}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Custom Event
            </button>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Event Log</h2>
            <button
              onClick={clearEvents}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
            >
              Clear Log
            </button>
          </div>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events fired yet. Click the test buttons above to start testing.
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event) => (
                <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getStatusIcon(event.status)}</span>
                      <span className="font-semibold text-gray-900">{event.eventName}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">{event.timestamp}</span>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                      {JSON.stringify(event.parameters, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Information */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Debug Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Browser Info:</h3>
              <div className="space-y-1 text-gray-600">
                <div>User Agent: {typeof window !== 'undefined' ? window.navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
                <div>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</div>
                <div>Timestamp: {new Date().toISOString()}</div>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">Pixel Info:</h3>
              <div className="space-y-1 text-gray-600">
                <div>Pixel Available: {typeof window !== 'undefined' && (window as any).fbq ? 'Yes' : 'No'}</div>
                <div>Pixel ID: {pixelId || 'Not configured'}</div>
                <div>Environment: {process.env.NODE_ENV}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <a
              href="https://business.facebook.com/events_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Open Events Manager
            </a>
            
            <a
              href="https://chrome.google.com/webstore/detail/meta-pixel-helper/fdgfkebogiimcoedlicjlajpkdmockpc"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Install Pixel Helper
            </a>
            
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
