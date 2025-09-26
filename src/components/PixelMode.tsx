'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    fbq: any;
    __PIXEL_MODE__: boolean;
  }
}

export default function PixelMode() {
  const [pixelLoaded, setPixelLoaded] = useState(false);

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Enable pixel mode
    window.__PIXEL_MODE__ = true;

    const pixelId = '24528287270184892';

    // Disable protection temporarily for pixel
    const disableProtectionForPixel = () => {
      try {
        // Override protection functions temporarily
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function(type, listener, options) {
          // Allow pixel-related events
          if (type === 'load' || type === 'error' || type.includes('facebook') || type.includes('pixel')) {
            return originalAddEventListener.call(this, type, listener, options);
          }
          return originalAddEventListener.call(this, type, listener, options);
        };

        // Override fetch to allow pixel requests
        const originalFetch = window.fetch;
        window.fetch = function(url, options) {
          if (typeof url === 'string' && (url.includes('facebook') || url.includes('fbevents'))) {
            return originalFetch.call(this, url, options);
          }
          return originalFetch.call(this, url, options);
        };

        console.log('✅ Protection temporarily disabled for pixel');
      } catch (error) {
        console.error('❌ Failed to disable protection:', error);
      }
    };

    // Load pixel with maximum priority
    const loadPixelWithPriority = () => {
      try {
        // Create pixel script with highest priority
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = false; // Synchronous for maximum priority
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        script.setAttribute('data-pixel-priority', 'maximum');
        script.setAttribute('data-bypass-all', 'true');
        
        // Insert at the very beginning of head
        const head = document.head || document.getElementsByTagName('head')[0];
        head.insertBefore(script, head.firstChild);

        script.onload = () => {
          try {
            // Facebook pixel code
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Initialize pixel
            window.fbq('init', pixelId);
            window.fbq('track', 'PageView');
            
            setPixelLoaded(true);
            console.log('✅ Pixel loaded with maximum priority');
            
          } catch (error) {
            console.error('❌ Pixel initialization failed:', error);
          }
        };

        script.onerror = () => {
          console.error('❌ Failed to load pixel script');
        };

      } catch (error) {
        console.error('❌ Pixel setup failed:', error);
      }
    };

    // Execute pixel loading
    disableProtectionForPixel();
    loadPixelWithPriority();

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
      window.__PIXEL_MODE__ = false;
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, []);

  // Debug component (only in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        left: '10px',
        background: pixelLoaded ? '#d4edda' : '#f8d7da',
        color: pixelLoaded ? '#155724' : '#721c24',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        Pixel Mode: {pixelLoaded ? 'LOADED' : 'LOADING...'}
      </div>
    );
  }

  return null;
}
