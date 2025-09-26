'use client';

import { useState, useEffect } from 'react';

export default function TestEventsPage() {
  const [events, setEvents] = useState<Array<{
    id: string;
    eventName: string;
    parameters: any;
    timestamp: string;
    status: 'success' | 'error' | 'pending';
  }>>([]);
  
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [testCode, setTestCode] = useState('TEST93223');

  useEffect(() => {
    // Check pixel status
    const checkPixel = () => {
      if (typeof window !== 'undefined') {
        if ((window as any).fbq) {
          setPixelStatus('ready');
        } else {
          setPixelStatus('error');
        }
      }
    };

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
    setEvents(prev => [newEvent, ...prev.slice(0, 9)]);
  };

  const trackTestEvent = (eventName: string, parameters: any) => {
    addEvent(eventName, parameters, 'pending');
    
    if (typeof window !== 'undefined' && (window as any).fbq) {
      try {
        // Add test event code to parameters
        const testParameters = {
          ...parameters,
          test_event_code: testCode
        };
        
        (window as any).fbq('track', eventName, testParameters);
        addEvent(eventName, testParameters, 'success');
        console.log(`✅ Test event sent: ${eventName}`, testParameters);
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
      trackTestEvent('PageView', {
        page_title: 'Test Events Page',
        page_location: window.location.href
      });
    },
    
    viewContent: () => {
      trackTestEvent('ViewContent', {
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        value: 5000,
        currency: 'DZD'
      });
    },
    
    addToCart: () => {
      trackTestEvent('AddToCart', {
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        value: 5000,
        currency: 'DZD',
        num_items: 1
      });
    },
    
    initiateCheckout: () => {
      trackTestEvent('InitiateCheckout', {
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        value: 5000,
        currency: 'DZD',
        num_items: 1
      });
    },
    
    purchase: () => {
      trackTestEvent('Purchase', {
        value: 5000,
        currency: 'DZD',
        content_name: 'كرة الموجات فوق الصوتية',
        content_category: 'هدايا',
        content_ids: ['ultrasound-orb'],
        num_items: 1,
        order_id: `test_order_${Date.now()}`
      });
    }
  };

  const sendAllTestEvents = () => {
    console.log('🧪 Sending all test events with code:', testCode);
    
    const events = [
      { name: 'PageView', func: testEvents.pageView },
      { name: 'ViewContent', func: testEvents.viewContent },
      { name: 'AddToCart', func: testEvents.addToCart },
      { name: 'InitiateCheckout', func: testEvents.initiateCheckout },
      { name: 'Purchase', func: testEvents.purchase }
    ];
    
    events.forEach((event, index) => {
      setTimeout(() => {
        console.log(`\n--- Sending ${event.name} (${index + 1}/${events.length}) ---`);
        event.func();
      }, index * 2000);
    });
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Meta Pixel Test Events</h1>
          <p className="text-gray-600 mb-4">
            Send test events to Facebook with your unique test code
          </p>
          
          {/* Test Code Input */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <label className="block text-sm font-medium text-blue-900 mb-2">
              Test Event Code (from Facebook Events Manager):
            </label>
            <input
              type="text"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your test event code"
            />
            <p className="text-xs text-blue-700 mt-1">
              This code will be included in all test events sent to Facebook
            </p>
          </div>
          
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
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">How to Use Test Events:</h3>
            <ol className="text-sm text-green-800 space-y-1">
              <li>1. Go to <a href="https://business.facebook.com/events_manager" target="_blank" rel="noopener noreferrer" className="underline">Facebook Events Manager</a></li>
              <li>2. Select your pixel and go to "Test Events" tab</li>
              <li>3. Copy the unique test code (e.g., TEST93223)</li>
              <li>4. Paste it in the input field above</li>
              <li>5. Click "Send All Test Events" button</li>
              <li>6. Check Facebook Events Manager to see the events</li>
            </ol>
          </div>
        </div>

        {/* Test Buttons */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Events</h2>
          
          {/* Send All Button */}
          <div className="mb-6">
            <button
              onClick={sendAllTestEvents}
              disabled={pixelStatus !== 'ready' || !testCode}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
            >
              🚀 Send All Test Events (with {testCode})
            </button>
            <p className="text-sm text-gray-600 mt-2 text-center">
              This will send all 5 events with 2-second delays between each
            </p>
          </div>
          
          {/* Individual Event Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <button
              onClick={testEvents.pageView}
              disabled={pixelStatus !== 'ready' || !testCode}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              PageView
            </button>
            
            <button
              onClick={testEvents.viewContent}
              disabled={pixelStatus !== 'ready' || !testCode}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              ViewContent
            </button>
            
            <button
              onClick={testEvents.addToCart}
              disabled={pixelStatus !== 'ready' || !testCode}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              AddToCart
            </button>
            
            <button
              onClick={testEvents.initiateCheckout}
              disabled={pixelStatus !== 'ready' || !testCode}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              InitiateCheckout
            </button>
            
            <button
              onClick={testEvents.purchase}
              disabled={pixelStatus !== 'ready' || !testCode}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Purchase
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
              No test events sent yet. Click the buttons above to start testing.
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
