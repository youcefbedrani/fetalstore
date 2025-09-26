'use client';

import { useState, useEffect } from 'react';

export default function PixelTestSimple() {
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [events, setEvents] = useState<Array<{
    id: string;
    eventName: string;
    parameters: any;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
  }>>([]);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const pixelId = '24528287270184892';

    // Load pixel with maximum priority
    const loadPixel = () => {
      try {
        // Create script element
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = false; // Synchronous for maximum priority
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        // Add to head immediately
        document.head.appendChild(script);

        script.onload = () => {
          try {
            // Facebook's official pixel code
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Initialize pixel
            (window as any).fbq('init', pixelId);
            (window as any).fbq('track', 'PageView');
            
            setPixelStatus('ready');
            console.log('✅ Pixel loaded successfully');
            
          } catch (error) {
            console.error('❌ Pixel initialization failed:', error);
            setPixelStatus('error');
          }
        };

        script.onerror = () => {
          console.error('❌ Failed to load pixel script');
          setPixelStatus('error');
        };

      } catch (error) {
        console.error('❌ Pixel setup failed:', error);
        setPixelStatus('error');
      }
    };

    // Load pixel immediately
    loadPixel();

    // Also add noscript fallback
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = '1';
    img.width = '1';
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    img.alt = '';
    noscript.appendChild(img);
    document.head.appendChild(noscript);

    // Cleanup
    return () => {
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, []);

  const addEvent = (eventName: string, parameters: any, status: 'success' | 'error' | 'pending' = 'pending') => {
    const newEvent = {
      id: Math.random().toString(36).substr(2, 9),
      eventName,
      parameters,
      timestamp: new Date().toLocaleTimeString(),
      status
    };
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
  };

  const testPixel = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      addEvent('Test', {}, 'success');
      console.log('✅ Pixel is working');
    } else {
      addEvent('Test', {}, 'error');
      console.log('❌ Pixel is not working');
    }
  };

  const sendTestEvent = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', 'PageView', {
          test_event_code: 'TEST93223'
        });
        addEvent('PageView', { test_event_code: 'TEST93223' }, 'success');
        console.log('✅ Test event sent with TEST93223');
      } catch (error) {
        addEvent('PageView', { test_event_code: 'TEST93223' }, 'error');
        console.error('❌ Failed to send test event:', error);
      }
    } else {
      addEvent('PageView', { test_event_code: 'TEST93223' }, 'error');
      console.error('❌ Pixel not available');
    }
  };

  const sendPurchaseEvent = () => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        (window as any).fbq('track', 'Purchase', {
          value: 5000,
          currency: 'DZD',
          content_name: 'كرة الموجات فوق الصوتية',
          content_category: 'هدايا',
          content_ids: ['ultrasound-orb'],
          num_items: 1,
          order_id: `test_order_${Date.now()}`,
          test_event_code: 'TEST93223'
        });
        addEvent('Purchase', { 
          value: 5000, 
          currency: 'DZD', 
          test_event_code: 'TEST93223' 
        }, 'success');
        console.log('✅ Purchase event sent with TEST93223');
      } catch (error) {
        addEvent('Purchase', { 
          value: 5000, 
          currency: 'DZD', 
          test_event_code: 'TEST93223' 
        }, 'error');
        console.error('❌ Failed to send purchase event:', error);
      }
    } else {
      addEvent('Purchase', { 
        value: 5000, 
        currency: 'DZD', 
        test_event_code: 'TEST93223' 
      }, 'error');
      console.error('❌ Pixel not available');
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎯 Simple Pixel Test</h1>
          <p className="text-gray-600 mb-4">
            This page has minimal protection - just pure Meta Pixel testing
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
              Pixel ID: <span className="font-mono">24528287270184892</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to Test:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Wait for pixel to load (should show "✅ Pixel Ready")</li>
              <li>2. Click "Test Pixel" to check if it's working</li>
              <li>3. Click "Send Test Event" to send TEST93223</li>
              <li>4. Check Facebook Events Manager for the events</li>
              <li>5. Use Meta Pixel Helper to verify</li>
            </ol>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testPixel}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Test Pixel
            </button>
            
            <button
              onClick={sendTestEvent}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send Test Event (TEST93223)
            </button>
            
            <button
              onClick={sendPurchaseEvent}
              disabled={pixelStatus !== 'ready'}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Send Purchase Event
            </button>
            
            <button
              onClick={clearEvents}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Clear Events
            </button>
          </div>
        </div>

        {/* Event Log */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Event Log</h2>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No events sent yet. Click the test buttons above to start testing.
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
                  
                  {Object.keys(event.parameters).length > 0 && (
                    <div className="bg-gray-50 rounded p-3">
                      <pre className="text-sm text-gray-700 overflow-x-auto">
                        {JSON.stringify(event.parameters, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
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
