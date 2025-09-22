'use client';

import { useEffect, useRef } from 'react';

interface UltimateScreenshotProtectionProps {
  enabled?: boolean;
}

export default function UltimateScreenshotProtection({ enabled = true }: UltimateScreenshotProtectionProps) {
  const protectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const domObserverRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Ultimate screenshot protection
    const addUltimateProtection = () => {
      // 1. Block browser extension screenshots
      const blockExtensionScreenshots = () => {
        // Override all possible screenshot methods
        const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
        const originalToBlob = HTMLCanvasElement.prototype.toBlob;
        const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
        const originalGetImageDataHD = CanvasRenderingContext2D.prototype.getImageData;

        // Block canvas methods
        HTMLCanvasElement.prototype.toDataURL = function() {
          console.clear();
          console.log('%c🚫 Canvas Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
        };

        HTMLCanvasElement.prototype.toBlob = function() {
          console.clear();
          console.log('%c🚫 Canvas Blob Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return;
        };

        CanvasRenderingContext2D.prototype.getImageData = function() {
          console.clear();
          console.log('%c🚫 Image Data Access Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return new ImageData(1, 1);
        };

        // Block HTML2Canvas and similar libraries
        if (typeof window !== 'undefined') {
          (window as any).html2canvas = function() {
            console.clear();
            console.log('%c🚫 HTML2Canvas Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('HTML2Canvas blocked'));
          };

          (window as any).domtoimage = function() {
            console.clear();
            console.log('%c🚫 DomToImage Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('DomToImage blocked'));
          };

          (window as any).rasterizeHTML = function() {
            console.clear();
            console.log('%c🚫 RasterizeHTML Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('RasterizeHTML blocked'));
          };
        }

        // Block clipboard access
        if (navigator.clipboard) {
          const originalWrite = navigator.clipboard.write;
          const originalWriteText = navigator.clipboard.writeText;
          const originalRead = navigator.clipboard.read;
          const originalReadText = navigator.clipboard.readText;

          navigator.clipboard.write = function() {
            console.clear();
            console.log('%c🚫 Clipboard Write Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('Clipboard write blocked'));
          };

          navigator.clipboard.writeText = function() {
            console.clear();
            console.log('%c🚫 Clipboard WriteText Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('Clipboard writeText blocked'));
          };

          navigator.clipboard.read = function() {
            console.clear();
            console.log('%c🚫 Clipboard Read Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('Clipboard read blocked'));
          };

          navigator.clipboard.readText = function() {
            console.clear();
            console.log('%c🚫 Clipboard ReadText Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return Promise.reject(new Error('Clipboard readText blocked'));
          };
        }

        // Block document.execCommand
        const originalExecCommand = document.execCommand;
        document.execCommand = function(command, showUI, value) {
          if (command === 'copy' || command === 'cut' || command === 'paste') {
            console.clear();
            console.log('%c🚫 ExecCommand Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
          return originalExecCommand.call(this, command, showUI, value);
        };
      };

      // 2. Block mobile hardware screenshot buttons
      const blockMobileHardwareScreenshots = () => {
        // Block hardware key combinations
        const blockHardwareKeys = (e: KeyboardEvent) => {
          // Block Power button
          if (e.key === 'Power' || e.code === 'Power') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Power Button Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }

          // Block Volume buttons
          if (e.key === 'VolumeUp' || e.code === 'VolumeUp' || 
              e.key === 'VolumeDown' || e.code === 'VolumeDown') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Volume Button Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }

          // Block common screenshot combinations
          if ((e.key === 'Power' || e.code === 'Power') && 
              (e.key === 'VolumeUp' || e.code === 'VolumeUp' || 
               e.key === 'VolumeDown' || e.code === 'VolumeDown')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Hardware Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };

        // Block touch events that could trigger hardware screenshots
        const blockHardwareTouch = (e: TouchEvent) => {
          // Block multi-touch that could be hardware screenshot
          if (e.touches.length >= 2) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.clear();
            console.log('%c🚫 Hardware Touch Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
            return false;
          }
        };

        // Add event listeners
        document.addEventListener('keydown', blockHardwareKeys, { passive: false, capture: true });
        document.addEventListener('keyup', blockHardwareKeys, { passive: false, capture: true });
        document.addEventListener('touchstart', blockHardwareTouch, { passive: false, capture: true });
        document.addEventListener('touchend', blockHardwareTouch, { passive: false, capture: true });

        return () => {
          document.removeEventListener('keydown', blockHardwareKeys, { capture: true });
          document.removeEventListener('keyup', blockHardwareKeys, { capture: true });
          document.removeEventListener('touchstart', blockHardwareTouch, { capture: true });
          document.removeEventListener('touchend', blockHardwareTouch, { capture: true });
        };
      };

      // 3. Block DOM manipulation for screenshots
      const blockDOMManipulation = () => {
        // Monitor for DOM changes that could be screenshot extensions
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  
                  // Check for screenshot-related elements
                  const screenshotClasses = [
                    'screenshot', 'capture', 'snip', 'grab', 'shot', 'pic',
                    'html2canvas', 'domtoimage', 'rasterize', 'canvas',
                    'screenshot-extension', 'capture-extension', 'snip-extension'
                  ];
                  
                  const className = element.className?.toLowerCase() || '';
                  const id = element.id?.toLowerCase() || '';
                  const tagName = element.tagName?.toLowerCase() || '';
                  
                  // Remove screenshot-related elements
                  if (screenshotClasses.some(cls => 
                    className.includes(cls) || id.includes(cls)
                  )) {
                    element.remove();
                    console.clear();
                    console.log('%c🚫 Screenshot Element Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                  }
                  
                  // Block iframe elements that could be screenshot tools
                  if (tagName === 'iframe') {
                    const src = (element as HTMLIFrameElement).src?.toLowerCase() || '';
                    if (src.includes('screenshot') || src.includes('capture') || 
                        src.includes('snip') || src.includes('grab')) {
                      element.remove();
                      console.clear();
                      console.log('%c🚫 Screenshot Iframe Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                    }
                  }
                  
                  // Block canvas elements that could be used for screenshots
                  if (tagName === 'canvas') {
                    const canvas = element as HTMLCanvasElement;
                    // Disable canvas methods
                    canvas.toDataURL = function() {
                      console.clear();
                      console.log('%c🚫 Canvas Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
                    };
                    canvas.toBlob = function() {
                      console.clear();
                      console.log('%c🚫 Canvas Blob Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                      return;
                    };
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
        
        domObserverRef.current = observer;
        return observer;
      };

      // 4. Add invisible CSS protection
      const addInvisibleCSSProtection = () => {
        const style = document.createElement('style');
        style.id = 'ultimate-screenshot-protection';
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
        `;
        document.head.appendChild(style);
      };

      // 5. Continuous monitoring and blocking
      const startContinuousMonitoring = () => {
        protectionIntervalRef.current = setInterval(() => {
          // Check for dev tools
          if (window.outerHeight - window.innerHeight > 160 || 
              window.outerWidth - window.innerWidth > 160) {
            console.clear();
            console.log('%c🚫 Developer Tools Detected!', 'color: red; font-size: 50px; font-weight: bold;');
            console.log('%cThis website is protected. Please close developer tools.', 'color: red; font-size: 20px;');
          }

          // Check for screenshot-related global variables
          const suspiciousGlobals = [
            'html2canvas', 'domtoimage', 'rasterizeHTML', 'screenshot',
            'capture', 'snip', 'grab', 'shot', 'pic'
          ];
          
          suspiciousGlobals.forEach(global => {
            if ((window as any)[global]) {
              delete (window as any)[global];
              console.clear();
              console.log('%c🚫 Suspicious Activity Detected!', 'color: red; font-size: 30px; font-weight: bold;');
            }
          });

          // Block any new canvas elements
          const canvases = document.querySelectorAll('canvas');
          canvases.forEach(canvas => {
            if (!(canvas as any).__protected) {
              (canvas as any).__protected = true;
              canvas.toDataURL = function() {
                console.clear();
                console.log('%c🚫 Canvas Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
              };
              canvas.toBlob = function() {
                console.clear();
                console.log('%c🚫 Canvas Blob Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                return;
              };
            }
          });
        }, 1000);
      };

      // Initialize all protection
      blockExtensionScreenshots();
      const cleanupHardware = blockMobileHardwareScreenshots();
      const domObserver = blockDOMManipulation();
      addInvisibleCSSProtection();
      startContinuousMonitoring();

      // Cleanup function
      return () => {
        if (cleanupHardware) cleanupHardware();
        if (domObserver) domObserver.disconnect();
        if (protectionIntervalRef.current) {
          clearInterval(protectionIntervalRef.current);
        }
        
        const style = document.getElementById('ultimate-screenshot-protection');
        if (style) {
          style.remove();
        }
      };
    };

    // Start ultimate protection
    const cleanup = addUltimateProtection();

    return cleanup;
  }, [enabled]);

  return null;
}
