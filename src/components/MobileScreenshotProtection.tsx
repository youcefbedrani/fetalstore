'use client';

import { useEffect } from 'react';

interface MobileScreenshotProtectionProps {
  enabled?: boolean;
}

export default function MobileScreenshotProtection({ enabled = true }: MobileScreenshotProtectionProps) {
  useEffect(() => {
    if (!enabled) return;

    // Mobile-specific screenshot protection
    const addMobileProtection = () => {
      // 1. Disable mobile screenshot gestures
      const preventScreenshotGestures = (e: TouchEvent) => {
        // Block three-finger swipe (common screenshot gesture on some devices)
        if (e.touches.length >= 3) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.clear();
          console.log('%c🚫 Mobile Screenshot Gesture Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return false;
        }
        
        // Block long press (context menu trigger)
        if (e.touches.length === 1) {
          const touch = e.touches[0];
          const startTime = Date.now();
          
          const handleTouchEnd = () => {
            const duration = Date.now() - startTime;
            if (duration > 500) { // Long press detected
              e.preventDefault();
              e.stopPropagation();
              console.clear();
              console.log('%c🚫 Long Press Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            }
            document.removeEventListener('touchend', handleTouchEnd);
          };
          
          document.addEventListener('touchend', handleTouchEnd, { once: true });
        }
      };

      // 2. Disable mobile browser features that could be used for screenshots
      const disableMobileFeatures = () => {
        // Disable pull-to-refresh
        document.body.style.overscrollBehavior = 'none';
        
        // Disable zoom
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        } else {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
          document.head.appendChild(meta);
        }
        
        // Disable text selection
        document.body.style.webkitUserSelect = 'none';
        document.body.style.mozUserSelect = 'none';
        document.body.style.msUserSelect = 'none';
        document.body.style.userSelect = 'none';
        
        // Disable touch callouts
        document.body.style.webkitTouchCallout = 'none';
        
        // Disable tap highlights
        document.body.style.webkitTapHighlightColor = 'transparent';
      };

      // 3. Add mobile-specific CSS protection
      const addMobileCSS = () => {
        const style = document.createElement('style');
        style.id = 'mobile-screenshot-protection';
        style.textContent = `
          /* Mobile-specific protection */
          @media (max-width: 768px) {
            body {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              -khtml-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
              -webkit-tap-highlight-color: transparent !important;
              overscroll-behavior: none !important;
              touch-action: manipulation !important;
            }
            
            /* Disable mobile screenshot gestures */
            * {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
              -webkit-tap-highlight-color: transparent !important;
            }
            
            /* Allow text selection only in input fields */
            input, textarea, [contenteditable] {
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
              user-select: text !important;
            }
            
            /* Disable image dragging */
            img, picture, video, canvas, svg {
              -webkit-user-drag: none !important;
              -khtml-user-drag: none !important;
              -moz-user-drag: none !important;
              -o-user-drag: none !important;
              user-drag: none !important;
              pointer-events: none !important;
            }
            
            /* Disable context menu */
            * {
              -webkit-context-menu: none !important;
              -moz-context-menu: none !important;
              -ms-context-menu: none !important;
              context-menu: none !important;
            }
            
            /* Add mobile screenshot protection overlay */
            body::before {
              content: '' !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background: transparent !important;
              z-index: 2147483647 !important;
              pointer-events: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
            }
            
            /* Disable mobile browser features */
            body {
              overscroll-behavior: none !important;
              touch-action: manipulation !important;
            }
          }
          
          /* iOS-specific protection */
          @media (max-width: 768px) and (-webkit-min-device-pixel-ratio: 2) {
            body::after {
              content: '' !important;
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100% !important;
              height: 100% !important;
              background: transparent !important;
              z-index: 2147483648 !important;
              pointer-events: none !important;
              opacity: 0 !important;
              visibility: hidden !important;
            }
          }
        `;
        document.head.appendChild(style);
      };

      // 4. Monitor for mobile screenshot attempts
      const monitorMobileScreenshots = () => {
        // Monitor for suspicious touch patterns
        let touchStartTime = 0;
        let touchCount = 0;
        
        const handleTouchStart = (e: TouchEvent) => {
          touchStartTime = Date.now();
          touchCount = e.touches.length;
          
          // Block multi-touch gestures that could be screenshots
          if (e.touches.length >= 3) {
            e.preventDefault();
            e.stopPropagation();
            console.clear();
            console.log('%c🚫 Multi-touch Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };
        
        const handleTouchEnd = (e: TouchEvent) => {
          const duration = Date.now() - touchStartTime;
          
          // Block long press (common for mobile screenshots)
          if (duration > 1000 && touchCount === 1) {
            e.preventDefault();
            e.stopPropagation();
            console.clear();
            console.log('%c🚫 Long Press Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };
        
        // Add event listeners
        document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
        
        return () => {
          document.removeEventListener('touchstart', handleTouchStart, { capture: true });
          document.removeEventListener('touchend', handleTouchEnd, { capture: true });
        };
      };

      // 5. Block mobile browser extensions
      const blockMobileExtensions = () => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  
                  // Check for mobile screenshot extensions
                  const mobileScreenshotClasses = [
                    'screenshot', 'capture', 'snip', 'grab', 'shot',
                    'mobile-screenshot', 'mobile-capture', 'mobile-snip'
                  ];
                  
                  const className = element.className?.toLowerCase() || '';
                  const id = element.id?.toLowerCase() || '';
                  
                  if (mobileScreenshotClasses.some(cls => 
                    className.includes(cls) || id.includes(cls)
                  )) {
                    element.remove();
                    console.clear();
                    console.log('%c🚫 Mobile Screenshot Extension Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
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

      // Initialize all mobile protection
      disableMobileFeatures();
      addMobileCSS();
      const cleanupTouch = monitorMobileScreenshots();
      const extensionObserver = blockMobileExtensions();
      
      // Add touch event listeners
      document.addEventListener('touchstart', preventScreenshotGestures, { passive: false, capture: true });
      document.addEventListener('touchmove', preventScreenshotGestures, { passive: false, capture: true });
      document.addEventListener('touchend', preventScreenshotGestures, { passive: false, capture: true });
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }, { passive: false, capture: true });

      // Cleanup function
      return () => {
        if (cleanupTouch) cleanupTouch();
        if (extensionObserver) extensionObserver.disconnect();
        
        document.removeEventListener('touchstart', preventScreenshotGestures, { capture: true });
        document.removeEventListener('touchmove', preventScreenshotGestures, { capture: true });
        document.removeEventListener('touchend', preventScreenshotGestures, { capture: true });
        document.removeEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, { capture: true });
        
        const style = document.getElementById('mobile-screenshot-protection');
        if (style) {
          style.remove();
        }
      };
    };

    // Start mobile protection
    const cleanup = addMobileProtection();

    return cleanup;
  }, [enabled]);

  return null;
}
