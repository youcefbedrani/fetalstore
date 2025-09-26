#!/usr/bin/env node

/**
 * Meta Pixel Test Script
 * 
 * This script helps you test Meta Pixel events programmatically.
 * Run this in your browser console on your website to test events.
 */

console.log('🎯 Meta Pixel Test Script Loaded');
console.log('📋 Available test functions:');
console.log('  - testPageView()');
console.log('  - testViewContent()');
console.log('  - testAddToCart()');
console.log('  - testInitiateCheckout()');
console.log('  - testPurchase()');
console.log('  - testAllEvents()');
console.log('  - testAllEventsWithCode("TEST93223")');
console.log('  - checkPixelStatus()');

// Test event code from Facebook
const TEST_EVENT_CODE = 'TEST93223';

// Test functions
window.testPageView = function() {
  console.log('🧪 Testing PageView event...');
  if (window.fbq) {
    window.fbq('track', 'PageView', {
      page_title: 'Test Page',
      page_location: window.location.href,
      test_event_code: TEST_EVENT_CODE
    });
    console.log('✅ PageView event sent with test code:', TEST_EVENT_CODE);
  } else {
    console.error('❌ Meta Pixel not available');
  }
};

window.testViewContent = function() {
  console.log('🧪 Testing ViewContent event...');
  if (window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_name: 'كرة الموجات فوق الصوتية',
      content_category: 'هدايا',
      content_ids: ['ultrasound-orb'],
      value: 5000,
      currency: 'DZD',
      test_event_code: TEST_EVENT_CODE
    });
    console.log('✅ ViewContent event sent with test code:', TEST_EVENT_CODE);
  } else {
    console.error('❌ Meta Pixel not available');
  }
};

window.testAddToCart = function() {
  console.log('🧪 Testing AddToCart event...');
  if (window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_name: 'كرة الموجات فوق الصوتية',
      content_category: 'هدايا',
      content_ids: ['ultrasound-orb'],
      value: 5000,
      currency: 'DZD',
      num_items: 1,
      test_event_code: TEST_EVENT_CODE
    });
    console.log('✅ AddToCart event sent with test code:', TEST_EVENT_CODE);
  } else {
    console.error('❌ Meta Pixel not available');
  }
};

window.testInitiateCheckout = function() {
  console.log('🧪 Testing InitiateCheckout event...');
  if (window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'كرة الموجات فوق الصوتية',
      content_category: 'هدايا',
      content_ids: ['ultrasound-orb'],
      value: 5000,
      currency: 'DZD',
      num_items: 1,
      test_event_code: TEST_EVENT_CODE
    });
    console.log('✅ InitiateCheckout event sent with test code:', TEST_EVENT_CODE);
  } else {
    console.error('❌ Meta Pixel not available');
  }
};

window.testPurchase = function() {
  console.log('🧪 Testing Purchase event...');
  if (window.fbq) {
    window.fbq('track', 'Purchase', {
      value: 5000,
      currency: 'DZD',
      content_name: 'كرة الموجات فوق الصوتية',
      content_category: 'هدايا',
      content_ids: ['ultrasound-orb'],
      num_items: 1,
      order_id: `test_order_${Date.now()}`,
      test_event_code: TEST_EVENT_CODE
    });
    console.log('✅ Purchase event sent with test code:', TEST_EVENT_CODE);
  } else {
    console.error('❌ Meta Pixel not available');
  }
};

window.testAllEvents = function() {
  console.log('🧪 Testing all events with 2-second delays...');
  
  const events = [
    { name: 'PageView', func: window.testPageView },
    { name: 'ViewContent', func: window.testViewContent },
    { name: 'AddToCart', func: window.testAddToCart },
    { name: 'InitiateCheckout', func: window.testInitiateCheckout },
    { name: 'Purchase', func: window.testPurchase }
  ];
  
  events.forEach((event, index) => {
    setTimeout(() => {
      console.log(`\n--- Testing ${event.name} (${index + 1}/${events.length}) ---`);
      event.func();
    }, index * 2000);
  });
  
  console.log('⏳ All events will be sent over the next 10 seconds with test code:', TEST_EVENT_CODE);
};

window.testAllEventsWithCode = function(testCode) {
  console.log('🧪 Testing all events with custom test code:', testCode);
  
  const events = [
    { name: 'PageView', func: () => {
      if (window.fbq) {
        window.fbq('track', 'PageView', {
          page_title: 'Test Page',
          page_location: window.location.href,
          test_event_code: testCode
        });
        console.log('✅ PageView event sent with test code:', testCode);
      }
    }},
    { name: 'ViewContent', func: () => {
      if (window.fbq) {
        window.fbq('track', 'ViewContent', {
          content_name: 'كرة الموجات فوق الصوتية',
          content_category: 'هدايا',
          content_ids: ['ultrasound-orb'],
          value: 5000,
          currency: 'DZD',
          test_event_code: testCode
        });
        console.log('✅ ViewContent event sent with test code:', testCode);
      }
    }},
    { name: 'AddToCart', func: () => {
      if (window.fbq) {
        window.fbq('track', 'AddToCart', {
          content_name: 'كرة الموجات فوق الصوتية',
          content_category: 'هدايا',
          content_ids: ['ultrasound-orb'],
          value: 5000,
          currency: 'DZD',
          num_items: 1,
          test_event_code: testCode
        });
        console.log('✅ AddToCart event sent with test code:', testCode);
      }
    }},
    { name: 'InitiateCheckout', func: () => {
      if (window.fbq) {
        window.fbq('track', 'InitiateCheckout', {
          content_name: 'كرة الموجات فوق الصوتية',
          content_category: 'هدايا',
          content_ids: ['ultrasound-orb'],
          value: 5000,
          currency: 'DZD',
          num_items: 1,
          test_event_code: testCode
        });
        console.log('✅ InitiateCheckout event sent with test code:', testCode);
      }
    }},
    { name: 'Purchase', func: () => {
      if (window.fbq) {
        window.fbq('track', 'Purchase', {
          value: 5000,
          currency: 'DZD',
          content_name: 'كرة الموجات فوق الصوتية',
          content_category: 'هدايا',
          content_ids: ['ultrasound-orb'],
          num_items: 1,
          order_id: `test_order_${Date.now()}`,
          test_event_code: testCode
        });
        console.log('✅ Purchase event sent with test code:', testCode);
      }
    }}
  ];
  
  events.forEach((event, index) => {
    setTimeout(() => {
      console.log(`\n--- Testing ${event.name} (${index + 1}/${events.length}) ---`);
      event.func();
    }, index * 2000);
  });
  
  console.log('⏳ All events will be sent over the next 10 seconds with test code:', testCode);
};

window.checkPixelStatus = function() {
  console.log('🔍 Checking Meta Pixel status...');
  
  const status = {
    pixelAvailable: typeof window.fbq !== 'undefined',
    pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID || 'Not set',
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString()
  };
  
  console.table(status);
  
  if (status.pixelAvailable) {
    console.log('✅ Meta Pixel is loaded and ready');
  } else {
    console.error('❌ Meta Pixel is not available');
    console.log('💡 Make sure:');
    console.log('  1. NEXT_PUBLIC_META_PIXEL_ID is set in environment variables');
    console.log('  2. The pixel script is loaded in your layout.tsx');
    console.log('  3. No JavaScript errors are blocking the pixel');
  }
};

// Auto-check pixel status when script loads
setTimeout(() => {
  window.checkPixelStatus();
}, 1000);

console.log('\n🚀 Ready to test! Try running:');
console.log('  - testAllEvents() - uses default test code TEST93223');
console.log('  - testAllEventsWithCode("YOUR_CODE") - uses custom test code');
console.log('  - checkPixelStatus() - check if pixel is working');
