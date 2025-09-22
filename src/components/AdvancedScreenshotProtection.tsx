'use client';

import { useEffect, useRef } from 'react';

interface AdvancedScreenshotProtectionProps {
  enabled?: boolean;
}

export default function AdvancedScreenshotProtection({ enabled = true }: AdvancedScreenshotProtectionProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // 1. Create visual protection overlay
    const createVisualProtection = () => {
      const overlay = document.createElement('div');
      overlay.id = 'screenshot-protection-overlay';
      overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background: transparent !important;
        z-index: 2147483647 !important;
        pointer-events: none !important;
        user-select: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      `;
      
      // Add invisible elements for screenshot protection
      for (let i = 0; i < 5; i++) {
        const element = document.createElement('div');
        element.style.cssText = `
          position: absolute !important;
          width: 1px !important;
          height: 1px !important;
          background: transparent !important;
          border-radius: 50% !important;
          animation: move${i} 3s linear infinite !important;
          pointer-events: none !important;
          opacity: 0 !important;
          visibility: hidden !important;
        `;
        overlay.appendChild(element);
      }
      
      document.body.appendChild(overlay);
      overlayRef.current = overlay;
    };

    // 2. Add CSS animations for moving elements
    const addProtectionStyles = () => {
      const style = document.createElement('style');
      style.id = 'advanced-screenshot-protection';
      style.textContent = `
        @keyframes move0 {
          0% { top: 0%; left: 0%; }
          25% { top: 25%; left: 75%; }
          50% { top: 50%; left: 50%; }
          75% { top: 75%; left: 25%; }
          100% { top: 0%; left: 0%; }
        }
        @keyframes move1 {
          0% { top: 100%; left: 100%; }
          25% { top: 75%; left: 25%; }
          50% { top: 50%; left: 50%; }
          75% { top: 25%; left: 75%; }
          100% { top: 100%; left: 100%; }
        }
        @keyframes move2 {
          0% { top: 50%; left: 0%; }
          25% { top: 0%; left: 50%; }
          50% { top: 50%; left: 100%; }
          75% { top: 100%; left: 50%; }
          100% { top: 50%; left: 0%; }
        }
        @keyframes move3 {
          0% { top: 0%; left: 50%; }
          25% { top: 50%; left: 100%; }
          50% { top: 100%; left: 50%; }
          75% { top: 50%; left: 0%; }
          100% { top: 0%; left: 50%; }
        }
        @keyframes move4 {
          0% { top: 25%; left: 25%; }
          25% { top: 75%; left: 75%; }
          50% { top: 25%; left: 75%; }
          75% { top: 75%; left: 25%; }
          100% { top: 25%; left: 25%; }
        }
        
        /* Additional protection styles */
        body {
          -webkit-touch-callout: none !important;
          -webkit-user-select: none !important;
          -khtml-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Disable all interactions on protected elements */
        img, picture, video, canvas, svg {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
        }
        
        /* Hide content when printing */
        @media print {
          * {
            display: none !important;
            visibility: hidden !important;
          }
          body {
            display: none !important;
            visibility: hidden !important;
          }
        }
        
        /* Additional mobile protection */
        @media (max-width: 768px) {
          body::before {
            content: '' !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: transparent !important;
            z-index: 2147483646 !important;
            pointer-events: none !important;
          }
        }
      `;
      document.head.appendChild(style);
    };

    // 3. Advanced screenshot detection
    const detectScreenshots = () => {
      // Method 1: Monitor for screenshot-related events
      const originalAddEventListener = EventTarget.prototype.addEventListener;
      EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'keydown' || type === 'keyup') {
          const wrappedListener = function(event: KeyboardEvent) {
            // Block screenshot keys
            if (event.key === 'PrintScreen' || 
                (event.altKey && event.key === 'PrintScreen') ||
                (event.metaKey && event.shiftKey && event.key === 's')) {
              event.preventDefault();
              event.stopPropagation();
              event.stopImmediatePropagation();
              console.clear();
              console.log('%c🚫 Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
              return false;
            }
            return listener.call(this, event);
          };
          return originalAddEventListener.call(this, type, wrappedListener, options);
        }
        return originalAddEventListener.call(this, type, listener, options);
      };

      // Method 2: Monitor for extension activity
      const detectExtensions = () => {
        // Check for common screenshot extensions
        const extensionSignatures = [
          'screenshot',
          'capture',
          'snip',
          'grab',
          'shot',
          'pic',
          'image'
        ];
        
        // Monitor for extension-related DOM changes
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  const className = element.className?.toLowerCase() || '';
                  const id = element.id?.toLowerCase() || '';
                  
                  if (extensionSignatures.some(sig => className.includes(sig) || id.includes(sig))) {
                    element.remove();
                    console.clear();
                    console.log('%c🚫 Extension Detected and Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                  }
                }
              });
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        return observer;
      };

      // Method 3: Monitor for clipboard access
      const monitorClipboard = () => {
        const originalWrite = navigator.clipboard?.write;
        if (originalWrite) {
          navigator.clipboard.write = function(data) {
            console.clear();
            console.log('%c🚫 Clipboard Access Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('Clipboard access blocked'));
          };
        }
      };

      // Method 4: Monitor for canvas access (common in screenshot tools)
      const monitorCanvas = () => {
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        HTMLCanvasElement.prototype.toDataURL = function() {
          console.clear();
          console.log('%c🚫 Canvas Access Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        };
      };

      // Method 5: Monitor for getImageData (another screenshot method)
      const monitorImageData = () => {
        const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
        CanvasRenderingContext2D.prototype.getImageData = function() {
          console.clear();
          console.log('%c🚫 Image Data Access Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return new ImageData(1, 1);
        };
      };

      // Start all monitoring
      const extensionObserver = detectExtensions();
      monitorClipboard();
      monitorCanvas();
      monitorImageData();

      return extensionObserver;
    };

    // 4. Mobile-specific protection
    const addMobileProtection = () => {
      // Disable mobile screenshot gestures
      const preventMobileScreenshot = (e: TouchEvent) => {
        if (e.touches.length >= 3) {
          e.preventDefault();
          e.stopPropagation();
          console.clear();
          console.log('%c🚫 Mobile Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return false;
        }
      };

      // Disable long press (common for mobile screenshots)
      const preventLongPress = (e: TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      };

      // Add mobile event listeners
      document.addEventListener('touchstart', preventMobileScreenshot, { passive: false, capture: true });
      document.addEventListener('touchmove', preventMobileScreenshot, { passive: false, capture: true });
      document.addEventListener('touchend', preventMobileScreenshot, { passive: false, capture: true });
      document.addEventListener('contextmenu', preventLongPress, { passive: false, capture: true });

      // Disable mobile browser features
      const meta = document.createElement('meta');
      meta.name = 'format-detection';
      meta.content = 'telephone=no';
      document.head.appendChild(meta);

      const meta2 = document.createElement('meta');
      meta2.name = 'apple-mobile-web-app-capable';
      meta2.content = 'no';
      document.head.appendChild(meta2);
    };

    // 5. Continuous monitoring
    const startContinuousMonitoring = () => {
      detectionIntervalRef.current = setInterval(() => {
        // Check for dev tools
        if (window.outerHeight - window.innerHeight > 160 || 
            window.outerWidth - window.innerWidth > 160) {
          console.clear();
          console.log('%c🚫 Developer Tools Detected!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cThis website is protected. Please close developer tools.', 'color: red; font-size: 20px;');
        }

        // Check for screenshot-related global variables
        const suspiciousGlobals = ['screenshot', 'capture', 'snip', 'grab'];
        suspiciousGlobals.forEach(global => {
          if ((window as any)[global]) {
            delete (window as any)[global];
            console.clear();
            console.log('%c🚫 Suspicious Activity Detected!', 'color: red; font-size: 30px; font-weight: bold;');
          }
        });
      }, 1000);
    };

    // Initialize all protection
    createVisualProtection();
    addProtectionStyles();
    const extensionObserver = detectScreenshots();
    addMobileProtection();
    startContinuousMonitoring();

    // Cleanup function
    return () => {
      if (detectionIntervalRef.current) {
        clearInterval(detectionIntervalRef.current);
      }
      
      if (overlayRef.current) {
        overlayRef.current.remove();
      }
      
      if (extensionObserver) {
        extensionObserver.disconnect();
      }
      
      // Remove styles
      const style = document.getElementById('advanced-screenshot-protection');
      if (style) {
        style.remove();
      }
      
      // Remove event listeners
      document.removeEventListener('touchstart', preventMobileScreenshot);
      document.removeEventListener('touchmove', preventMobileScreenshot);
      document.removeEventListener('touchend', preventMobileScreenshot);
      document.removeEventListener('contextmenu', preventLongPress);
    };
  }, [enabled]);

  return null; // This component doesn't render anything
}
