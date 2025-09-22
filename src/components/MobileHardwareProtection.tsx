'use client';

import { useEffect } from 'react';

interface MobileHardwareProtectionProps {
  enabled?: boolean;
}

export default function MobileHardwareProtection({ enabled = true }: MobileHardwareProtectionProps) {
  useEffect(() => {
    if (!enabled) return;

    // Mobile hardware screenshot protection
    const addMobileHardwareProtection = () => {
      // 1. Block hardware screenshot buttons
      const blockHardwareScreenshots = () => {
        // Block Power button
        const blockPowerButton = (e: KeyboardEvent) => {
          if (e.key === 'Power' || e.code === 'Power' || e.keyCode === 116) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Power Button Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };

        // Block Volume buttons
        const blockVolumeButtons = (e: KeyboardEvent) => {
          if (e.key === 'VolumeUp' || e.code === 'VolumeUp' || e.keyCode === 175 ||
              e.key === 'VolumeDown' || e.code === 'VolumeDown' || e.keyCode === 174) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Volume Button Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };

        // Block hardware screenshot combinations
        const blockHardwareCombinations = (e: KeyboardEvent) => {
          // Block Power + VolumeUp combination
          if ((e.key === 'Power' || e.code === 'Power') && 
              (e.key === 'VolumeUp' || e.code === 'VolumeUp')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Hardware Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }

          // Block Power + VolumeDown combination
          if ((e.key === 'Power' || e.code === 'Power') && 
              (e.key === 'VolumeDown' || e.code === 'VolumeDown')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Hardware Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };

        // Add event listeners
        document.addEventListener('keydown', blockPowerButton, { passive: false, capture: true });
        document.addEventListener('keyup', blockPowerButton, { passive: false, capture: true });
        document.addEventListener('keydown', blockVolumeButtons, { passive: false, capture: true });
        document.addEventListener('keyup', blockVolumeButtons, { passive: false, capture: true });
        document.addEventListener('keydown', blockHardwareCombinations, { passive: false, capture: true });
        document.addEventListener('keyup', blockHardwareCombinations, { passive: false, capture: true });

        return () => {
          document.removeEventListener('keydown', blockPowerButton, { capture: true });
          document.removeEventListener('keyup', blockPowerButton, { capture: true });
          document.removeEventListener('keydown', blockVolumeButtons, { capture: true });
          document.removeEventListener('keyup', blockVolumeButtons, { capture: true });
          document.removeEventListener('keydown', blockHardwareCombinations, { capture: true });
          document.removeEventListener('keyup', blockHardwareCombinations, { capture: true });
        };
      };

      // 2. Block touch events that could trigger hardware screenshots
      const blockHardwareTouch = () => {
        let touchStartTime = 0;
        let touchCount = 0;
        let powerButtonPressed = false;
        let volumeButtonPressed = false;

        const handleTouchStart = (e: TouchEvent) => {
          touchStartTime = Date.now();
          touchCount = e.touches.length;
          
          // Block multi-touch that could be hardware screenshot
          if (e.touches.length >= 2) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Multi-touch Hardware Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };

        const handleTouchEnd = (e: TouchEvent) => {
          const duration = Date.now() - touchStartTime;
          
          // Block long press that could trigger hardware screenshot
          if (duration > 500 && touchCount === 1) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Long Press Hardware Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };

        // Monitor for hardware button presses
        const monitorHardwareButtons = (e: KeyboardEvent) => {
          if (e.key === 'Power' || e.code === 'Power') {
            powerButtonPressed = true;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
          
          if (e.key === 'VolumeUp' || e.code === 'VolumeUp' || 
              e.key === 'VolumeDown' || e.code === 'VolumeDown') {
            volumeButtonPressed = true;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
          }
        };

        // Check for hardware screenshot combinations
        const checkHardwareCombinations = () => {
          if (powerButtonPressed && volumeButtonPressed) {
            console.clear();
            console.log('%c🚫 Hardware Screenshot Combination Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            powerButtonPressed = false;
            volumeButtonPressed = false;
          }
        };

        // Add event listeners
        document.addEventListener('touchstart', handleTouchStart, { passive: false, capture: true });
        document.addEventListener('touchend', handleTouchEnd, { passive: false, capture: true });
        document.addEventListener('keydown', monitorHardwareButtons, { passive: false, capture: true });
        document.addEventListener('keyup', monitorHardwareButtons, { passive: false, capture: true });

        // Check for combinations every 100ms
        const combinationInterval = setInterval(checkHardwareCombinations, 100);

        return () => {
          document.removeEventListener('touchstart', handleTouchStart, { capture: true });
          document.removeEventListener('touchend', handleTouchEnd, { capture: true });
          document.removeEventListener('keydown', monitorHardwareButtons, { capture: true });
          document.removeEventListener('keyup', monitorHardwareButtons, { capture: true });
          clearInterval(combinationInterval);
        };
      };

      // 3. Block mobile browser screenshot features
      const blockMobileBrowserFeatures = () => {
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

      // 4. Add mobile-specific CSS protection
      const addMobileCSSProtection = () => {
        const style = document.createElement('style');
        style.id = 'mobile-hardware-protection';
        style.textContent = `
          /* Mobile hardware protection */
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
            
            /* Disable hardware button interactions */
            * {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              -moz-user-select: none !important;
              -ms-user-select: none !important;
              user-select: none !important;
            }
            
            /* Allow text selection only in input fields */
            input, textarea, [contenteditable] {
              -webkit-user-select: text !important;
              -moz-user-select: text !important;
              -ms-user-select: text !important;
              user-select: text !important;
            }
          }
        `;
        document.head.appendChild(style);
      };

      // 5. Monitor for mobile screenshot attempts
      const monitorMobileScreenshots = () => {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  
                  // Check for mobile screenshot apps
                  const mobileScreenshotClasses = [
                    'screenshot', 'capture', 'snip', 'grab', 'shot',
                    'mobile-screenshot', 'mobile-capture', 'mobile-snip',
                    'screenshot-app', 'capture-app', 'snip-app',
                    'hardware-screenshot', 'power-volume-screenshot'
                  ];
                  
                  const className = element.className?.toLowerCase() || '';
                  const id = element.id?.toLowerCase() || '';
                  
                  if (mobileScreenshotClasses.some(cls => 
                    className.includes(cls) || id.includes(cls)
                  )) {
                    element.remove();
                    console.clear();
                    console.log('%c🚫 Mobile Screenshot App Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
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

      // Initialize all protection
      const cleanupHardware = blockHardwareScreenshots();
      const cleanupTouch = blockHardwareTouch();
      blockMobileBrowserFeatures();
      addMobileCSSProtection();
      const observer = monitorMobileScreenshots();

      // Cleanup function
      return () => {
        if (cleanupHardware) cleanupHardware();
        if (cleanupTouch) cleanupTouch();
        if (observer) observer.disconnect();
        
        const style = document.getElementById('mobile-hardware-protection');
        if (style) {
          style.remove();
        }
      };
    };

    // Start mobile hardware protection
    const cleanup = addMobileHardwareProtection();

    return cleanup;
  }, [enabled]);

  return null;
}
