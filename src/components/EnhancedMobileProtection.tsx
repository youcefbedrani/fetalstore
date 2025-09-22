'use client';

import { useEffect } from 'react';

interface EnhancedMobileProtectionProps {
  enabled?: boolean;
}

export default function EnhancedMobileProtection({ enabled = true }: EnhancedMobileProtectionProps) {
  useEffect(() => {
    if (!enabled) return;

    // Enhanced mobile screenshot protection
    const addEnhancedMobileProtection = () => {
      // 1. Block all mobile screenshot methods
      const blockMobileScreenshots = () => {
        // Block hardware screenshot buttons (Power + Volume)
        const blockHardwareScreenshots = (e: KeyboardEvent) => {
          // Block common mobile screenshot key combinations
          if (e.key === 'Power' || e.key === 'VolumeUp' || e.key === 'VolumeDown') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        };

        // Block touch events that could trigger screenshots
        const blockTouchScreenshots = (e: TouchEvent) => {
          // Block three-finger gestures
          if (e.touches.length >= 3) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }

          // Block long press (common for mobile screenshots)
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            const startTime = Date.now();
            
            const handleTouchEnd = () => {
              const duration = Date.now() - startTime;
              if (duration > 300) { // Shorter threshold for better protection
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            };
            
            document.addEventListener('touchend', handleTouchEnd, { once: true, passive: false });
          }
        };

        // Block mouse events that could be used for screenshots
        const blockMouseScreenshots = (e: MouseEvent) => {
          // Block right-click
          if (e.button === 2) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }

          // Block middle-click
          if (e.button === 1) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        };

        // Add event listeners with capture to intercept early
        document.addEventListener('keydown', blockHardwareScreenshots, { passive: false, capture: true });
        document.addEventListener('touchstart', blockTouchScreenshots, { passive: false, capture: true });
        document.addEventListener('touchmove', blockTouchScreenshots, { passive: false, capture: true });
        document.addEventListener('touchend', blockTouchScreenshots, { passive: false, capture: true });
        document.addEventListener('mousedown', blockMouseScreenshots, { passive: false, capture: true });
        document.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          e.stopPropagation();
          return false;
        }, { passive: false, capture: true });

        return () => {
          document.removeEventListener('keydown', blockHardwareScreenshots, { capture: true });
          document.removeEventListener('touchstart', blockTouchScreenshots, { capture: true });
          document.removeEventListener('touchmove', blockTouchScreenshots, { capture: true });
          document.removeEventListener('touchend', blockTouchScreenshots, { capture: true });
          document.removeEventListener('mousedown', blockMouseScreenshots, { capture: true });
        };
      };

      // 2. Add invisible CSS protection
      const addInvisibleCSSProtection = () => {
        const style = document.createElement('style');
        style.id = 'enhanced-mobile-protection';
        style.textContent = `
          /* Invisible protection - users won't see anything */
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
          
          /* Invisible overlay for screenshot protection */
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
            opacity: 0 !important;
            visibility: hidden !important;
          }
          
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
            
            /* Disable mobile browser features */
            body {
              overscroll-behavior: none !important;
              touch-action: manipulation !important;
            }
            
            /* Invisible mobile overlay */
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
          
          /* iOS-specific invisible protection */
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

      // 3. Block mobile browser extensions and apps
      const blockMobileExtensions = () => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  
                  // Check for mobile screenshot extensions and apps
                  const mobileScreenshotClasses = [
                    'screenshot', 'capture', 'snip', 'grab', 'shot',
                    'mobile-screenshot', 'mobile-capture', 'mobile-snip',
                    'screenshot-app', 'capture-app', 'snip-app'
                  ];
                  
                  const className = element.className?.toLowerCase() || '';
                  const id = element.id?.toLowerCase() || '';
                  const tagName = element.tagName?.toLowerCase() || '';
                  
                  if (mobileScreenshotClasses.some(cls => 
                    className.includes(cls) || id.includes(cls)
                  )) {
                    element.remove();
                  }
                  
                  // Block iframe elements that could be screenshot apps
                  if (tagName === 'iframe') {
                    const src = (element as HTMLIFrameElement).src?.toLowerCase() || '';
                    if (src.includes('screenshot') || src.includes('capture') || src.includes('snip')) {
                      element.remove();
                    }
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

      // 4. Monitor for mobile screenshot attempts
      const monitorMobileScreenshots = () => {
        let touchStartTime = 0;
        let touchCount = 0;
        
        const handleTouchStart = (e: TouchEvent) => {
          touchStartTime = Date.now();
          touchCount = e.touches.length;
          
          // Block multi-touch gestures that could be screenshots
          if (e.touches.length >= 3) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        };
        
        const handleTouchEnd = (e: TouchEvent) => {
          const duration = Date.now() - touchStartTime;
          
          // Block long press (common for mobile screenshots)
          if (duration > 500 && touchCount === 1) {
            e.preventDefault();
            e.stopPropagation();
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

      // 5. Block mobile browser features
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

      // Initialize all protection
      const cleanupTouch = blockMobileScreenshots();
      addInvisibleCSSProtection();
      const extensionObserver = blockMobileExtensions();
      const monitorCleanup = monitorMobileScreenshots();
      disableMobileFeatures();

      // Cleanup function
      return () => {
        if (cleanupTouch) cleanupTouch();
        if (extensionObserver) extensionObserver.disconnect();
        if (monitorCleanup) monitorCleanup();
        
        const style = document.getElementById('enhanced-mobile-protection');
        if (style) {
          style.remove();
        }
      };
    };

    // Start enhanced mobile protection
    const cleanup = addEnhancedMobileProtection();

    return cleanup;
  }, [enabled]);

  return null;
}
