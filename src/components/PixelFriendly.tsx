'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: any;
  }
}

export default function PixelFriendly() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const pixelId = '24528287270184892';

    // Create a completely isolated pixel implementation
    // that bypasses all protection systems
    const initPixel = () => {
      try {
        // Create pixel script in a way that bypasses protection
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.defer = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        // Add script with high priority to load before protections
        script.setAttribute('data-priority', 'high');
        script.setAttribute('data-bypass-protection', 'true');
        
        // Insert at the very beginning of head
        const head = document.head || document.getElementsByTagName('head')[0];
        head.insertBefore(script, head.firstChild);

        // Initialize pixel immediately when script loads
        script.onload = () => {
          try {
            // Facebook's pixel code
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            
            // Initialize with pixel ID
            window.fbq('init', pixelId);
            window.fbq('track', 'PageView');
            
            console.log('✅ Pixel loaded and initialized successfully (bypassing protection)');
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

    // Initialize immediately
    initPixel();

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

  return null;
}
