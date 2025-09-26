'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: any;
    __PIXEL_ULTIMATE_BYPASS__: boolean;
  }
}

export default function UltimatePixelBypass() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Set ultimate bypass flag
    window.__PIXEL_ULTIMATE_BYPASS__ = true;

    const pixelId = '24528287270184892';

    // Ultimate bypass method - load pixel in multiple ways
    const ultimateBypass = () => {
      try {
        // Method 1: Direct script injection
        const script1 = document.createElement('script');
        script1.innerHTML = `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `;
        script1.setAttribute('data-pixel-ultimate-bypass', 'true');
        document.head.appendChild(script1);

        // Method 2: External script with bypass
        const script2 = document.createElement('script');
        script2.src = 'https://connect.facebook.net/en_US/fbevents.js';
        script2.async = true;
        script2.setAttribute('data-bypass-all-protection', 'true');
        script2.setAttribute('data-pixel-priority', 'critical');
        document.head.appendChild(script2);

        // Method 3: Direct function call
        setTimeout(() => {
          try {
            if (window.fbq) {
              window.fbq('init', pixelId);
              window.fbq('track', 'PageView');
              console.log('✅ Ultimate bypass pixel initialized');
            }
          } catch (error) {
            console.error('❌ Ultimate bypass failed:', error);
          }
        }, 100);

        // Method 4: Image pixel fallback
        const img = document.createElement('img');
        img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
        img.style.display = 'none';
        img.width = 1;
        img.height = 1;
        img.setAttribute('data-pixel-fallback', 'true');
        document.body.appendChild(img);

        console.log('✅ Ultimate pixel bypass methods deployed');

      } catch (error) {
        console.error('❌ Ultimate bypass setup failed:', error);
      }
    };

    // Execute immediately
    ultimateBypass();

    // Also try after a delay
    setTimeout(ultimateBypass, 1000);

    // Cleanup
    return () => {
      window.__PIXEL_ULTIMATE_BYPASS__ = false;
    };
  }, []);

  return null;
}
