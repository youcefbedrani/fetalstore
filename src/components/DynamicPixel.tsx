'use client';

import { useEffect, useState } from 'react';

declare global {
  interface Window {
    fbq: any;
  }
}

export default function DynamicPixel() {
  const [pixelStatus, setPixelStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const pixelId = '24528287270184892';
    let scriptLoaded = false;

    // Function to initialize pixel
    const initializePixel = () => {
      try {
        if (window.fbq) {
          window.fbq('init', pixelId);
          console.log('✅ Meta Pixel initialized with ID:', pixelId);
          
          // Track PageView
          window.fbq('track', 'PageView');
          console.log('✅ Meta Pixel PageView tracked');
          
          setPixelStatus('ready');
        } else {
          console.error('❌ fbq function not available');
          setPixelStatus('error');
        }
      } catch (error) {
        console.error('❌ Pixel initialization failed:', error);
        setPixelStatus('error');
      }
    };

    // Function to load pixel script
    const loadPixelScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="fbevents.js"]');
        if (existingScript) {
          console.log('✅ Meta Pixel script already exists');
          resolve(true);
          return;
        }

        // Create script element
        const script = document.createElement('script');
        script.async = true;
        script.src = 'https://connect.facebook.net/en_US/fbevents.js';
        
        script.onload = () => {
          console.log('✅ Meta Pixel script loaded successfully');
          scriptLoaded = true;
          resolve(true);
        };
        
        script.onerror = () => {
          console.error('❌ Failed to load Meta Pixel script');
          reject(new Error('Script load failed'));
        };

        // Add script to head
        document.head.appendChild(script);
      });
    };

    // Function to wait for fbq to be available
    const waitForFbq = () => {
      return new Promise((resolve) => {
        const checkFbq = () => {
          if (window.fbq) {
            console.log('✅ fbq function is available');
            resolve(true);
          } else {
            setTimeout(checkFbq, 100);
          }
        };
        checkFbq();
      });
    };

    // Main initialization sequence
    const initSequence = async () => {
      try {
        console.log('🚀 Starting Meta Pixel initialization...');
        
        // Load the script
        await loadPixelScript();
        
        // Wait for fbq to be available
        await waitForFbq();
        
        // Initialize pixel
        initializePixel();
        
      } catch (error) {
        console.error('❌ Pixel initialization sequence failed:', error);
        setPixelStatus('error');
      }
    };

    // Start initialization
    initSequence();

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

  // Debug component (only in development)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: pixelStatus === 'ready' ? '#d4edda' : pixelStatus === 'error' ? '#f8d7da' : '#fff3cd',
        color: pixelStatus === 'ready' ? '#155724' : pixelStatus === 'error' ? '#721c24' : '#856404',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999
      }}>
        Meta Pixel: {pixelStatus}
      </div>
    );
  }

  return null;
}
