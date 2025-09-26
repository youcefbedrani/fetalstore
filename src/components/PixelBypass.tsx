'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: any;
    __PIXEL_BYPASS__: boolean;
  }
}

export default function PixelBypass() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Set bypass flag
    window.__PIXEL_BYPASS__ = true;

    const pixelId = '24528287270184892';

    // Create pixel with maximum priority
    const initPixel = () => {
      try {
        // Create script with highest priority
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = false; // Load synchronously for maximum priority
        script.defer = false;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        // Add bypass attributes
        script.setAttribute('data-priority', 'critical');
        script.setAttribute('data-bypass-protection', 'true');
        script.setAttribute('data-pixel-bypass', 'true');
        
        // Insert at the very beginning
        const head = document.head || document.getElementsByTagName('head')[0];
        head.insertBefore(script, head.firstChild);

        // Initialize when loaded
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
            
            console.log('✅ Pixel loaded with bypass protection');
            
            // Store pixel function globally for other components
            window.fbq = window.fbq;
            
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

    // Add noscript fallback
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
      window.__PIXEL_BYPASS__ = false;
    };
  }, []);

  return null;
}
