'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: any;
  }
}

export default function SimpleMetaPixel() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const pixelId = '24528287270184892';

    // Facebook's official pixel code
    const pixelCode = `
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

    // Execute the pixel code
    const script = document.createElement('script');
    script.innerHTML = pixelCode;
    document.head.appendChild(script);

    // Also add the noscript fallback
    const noscript = document.createElement('noscript');
    const img = document.createElement('img');
    img.height = '1';
    img.width = '1';
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
    img.alt = '';
    noscript.appendChild(img);
    document.head.appendChild(noscript);

    console.log('✅ Simple Meta Pixel loaded with ID:', pixelId);

    // Cleanup
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (noscript.parentNode) {
        noscript.parentNode.removeChild(noscript);
      }
    };
  }, []);

  return null;
}
