'use client';

import { useEffect } from 'react';

interface VisualScreenshotProtectionProps {
  enabled?: boolean;
}

export default function VisualScreenshotProtection({ enabled = true }: VisualScreenshotProtectionProps) {
  useEffect(() => {
    if (!enabled) return;

    // Create CSS that makes screenshots appear distorted or blank
    const addVisualProtection = () => {
      const style = document.createElement('style');
      style.id = 'visual-screenshot-protection';
      style.textContent = `
        /* Make screenshots appear blank or distorted */
        @media screen {
          body {
            position: relative !important;
          }
          
          body::before {
            content: '' !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: transparent !important;
            z-index: 2147483647 !important;
            pointer-events: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
            mix-blend-mode: difference !important;
          }
          
          body::after {
            content: '' !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: transparent !important;
            z-index: 2147483648 !important;
            pointer-events: none !important;
            opacity: 0 !important;
            visibility: hidden !important;
          }
        }
        
        @keyframes screenshotProtection {
          0% { opacity: 0; }
          50% { opacity: 0; }
          100% { opacity: 0; }
        }
        
        @keyframes pulse {
          0% { opacity: 0; }
          100% { opacity: 0; }
        }
        
        /* Additional protection for specific elements */
        img, picture, video, canvas {
          filter: none !important;
          -webkit-filter: none !important;
        }
        
        /* Hide content when printing or screenshotting */
        @media print {
          * {
            display: none !important;
            visibility: hidden !important;
          }
        }
        
        /* Mobile-specific protection */
        @media (max-width: 768px) {
          body::before {
            background: radial-gradient(circle, 
              rgba(255, 0, 0, 0.2) 0%, 
              rgba(0, 255, 0, 0.2) 33%, 
              rgba(0, 0, 255, 0.2) 66%, 
              rgba(255, 255, 0, 0.2) 100%) !important;
          }
        }
        
        /* Disable all user interactions that could lead to screenshots */
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Allow text selection only in input fields */
        input, textarea, [contenteditable] {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
        
        /* Disable image dragging and context menus */
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
      `;
      document.head.appendChild(style);
    };

    // Add JavaScript protection
    const addJavaScriptProtection = () => {
      // Override common screenshot methods
      const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
      HTMLCanvasElement.prototype.toDataURL = function() {
        console.clear();
        console.log('%c🚫 Canvas Screenshot Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
        return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
      };

      // Override getImageData
      const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
      CanvasRenderingContext2D.prototype.getImageData = function() {
        console.clear();
        console.log('%c🚫 Image Data Access Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
        return new ImageData(1, 1);
      };

      // Override clipboard access
      if (navigator.clipboard) {
        const originalWrite = navigator.clipboard.write;
        navigator.clipboard.write = function() {
          console.clear();
          console.log('%c🚫 Clipboard Access Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
          return Promise.reject(new Error('Clipboard access blocked'));
        };
      }

      // Block common screenshot extensions
      const blockExtensions = () => {
        const suspiciousSelectors = [
          '[class*="screenshot"]',
          '[class*="capture"]',
          '[class*="snip"]',
          '[class*="grab"]',
          '[id*="screenshot"]',
          '[id*="capture"]',
          '[id*="snip"]',
          '[id*="grab"]'
        ];

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  const element = node as Element;
                  suspiciousSelectors.forEach(selector => {
                    if (element.matches && element.matches(selector)) {
                      element.remove();
                      console.clear();
                      console.log('%c🚫 Screenshot Extension Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
                    }
                  });
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

      return blockExtensions();
    };

    // Initialize protection
    addVisualProtection();
    const extensionObserver = addJavaScriptProtection();

    // Cleanup function
    return () => {
      if (extensionObserver) {
        extensionObserver.disconnect();
      }
      
      const style = document.getElementById('visual-screenshot-protection');
      if (style) {
        style.remove();
      }
    };
  }, [enabled]);

  return null;
}
