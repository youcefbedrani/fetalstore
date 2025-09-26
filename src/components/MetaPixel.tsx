'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    fbq: any;
  }
}

export default function MetaPixel() {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const pixelId = '24528287270184892';

    // Check if pixel is already loaded
    if (window.fbq) {
      console.log('✅ Meta Pixel already loaded');
      return;
    }

    // Load Meta Pixel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    
    script.onload = () => {
      console.log('✅ Meta Pixel script loaded');
      
      // Initialize pixel
      try {
        window.fbq('init', pixelId);
        console.log('✅ Meta Pixel initialized with ID:', pixelId);
        
        // Track PageView with delay to ensure pixel is ready
        setTimeout(() => {
          window.fbq('track', 'PageView');
          console.log('✅ Meta Pixel PageView tracked');
        }, 200);
        
      } catch (error) {
        console.error('❌ Meta Pixel initialization failed:', error);
      }
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load Meta Pixel script');
    };

    // Add script to head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
