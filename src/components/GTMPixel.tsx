'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: any;
  }
}

export default function GTMPixel() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // GTM script
    const gtmScript = document.createElement('script');
    gtmScript.async = true;
    gtmScript.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX'; // You'll need to replace this with your GTM ID
    
    // Meta Pixel via GTM
    const pixelScript = document.createElement('script');
    pixelScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '24528287270184892');
      fbq('track', 'PageView');
    `;
    
    document.head.appendChild(pixelScript);
    
    console.log('✅ GTM Pixel component loaded');

    // Cleanup
    return () => {
      if (pixelScript.parentNode) {
        pixelScript.parentNode.removeChild(pixelScript);
      }
    };
  }, []);

  return null;
}
