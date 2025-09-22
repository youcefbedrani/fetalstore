'use client';

import { useEffect } from 'react';

interface ScreenshotProtectionProps {
  enabled?: boolean;
}

export default function ScreenshotProtection({ enabled = true }: ScreenshotProtectionProps) {
  useEffect(() => {
    if (!enabled) return;

    // 1. Disable right-click context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // 2. Disable common keyboard shortcuts for screenshots
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Print Screen
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      
      // Disable Alt + Print Screen
      if (e.altKey && e.key === 'PrintScreen') {
        e.preventDefault();
        return false;
      }
      
      // Disable Windows + Shift + S (Windows Snipping Tool)
      if (e.key === 's' && e.shiftKey && e.metaKey) {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl + Shift + S (Some browsers)
      if (e.key === 's' && e.shiftKey && e.ctrlKey) {
        e.preventDefault();
        return false;
      }
      
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl + Shift + I (Developer Tools)
      if (e.key === 'I' && e.shiftKey && e.ctrlKey) {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl + U (View Source)
      if (e.key === 'u' && e.ctrlKey) {
        e.preventDefault();
        return false;
      }
      
      // Disable Ctrl + S (Save Page)
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // 4. Disable drag and drop
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // 5. Add CSS to prevent screenshots
    const addScreenshotProtectionCSS = () => {
      const style = document.createElement('style');
      style.textContent = `
        /* Prevent text selection */
        * {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
        }
        
        /* Prevent image dragging */
        img {
          -webkit-user-drag: none !important;
          -khtml-user-drag: none !important;
          -moz-user-drag: none !important;
          -o-user-drag: none !important;
          user-drag: none !important;
          pointer-events: none !important;
        }
        
        /* Prevent context menu */
        * {
          -webkit-context-menu: none !important;
          -moz-context-menu: none !important;
          -ms-context-menu: none !important;
          context-menu: none !important;
        }
        
        /* Add overlay to prevent screenshots on some devices */
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          z-index: 999999;
          pointer-events: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        /* Prevent printing */
        @media print {
          * {
            display: none !important;
          }
        }
        
        /* Disable text selection on specific elements */
        input, textarea, button, a, select {
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          user-select: text !important;
        }
      `;
      document.head.appendChild(style);
    };

    // 6. Detect and warn about developer tools
    const detectDevTools = () => {
      let devtools = false;
      const threshold = 160;
      
      setInterval(() => {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
          if (!devtools) {
            devtools = true;
            console.clear();
            console.log('%c⚠️ Developer Tools Detected!', 'color: red; font-size: 20px; font-weight: bold;');
            console.log('%cThis website is protected against screenshots and unauthorized access.', 'color: red; font-size: 14px;');
            
            // Optional: Redirect or show warning
            // window.location.href = '/warning';
          }
        } else {
          devtools = false;
        }
      }, 500);
    };

    // 7. Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);
    
    // 8. Add CSS protection
    addScreenshotProtectionCSS();
    
    // 9. Detect developer tools
    detectDevTools();

    // 10. Add meta tags for additional protection
    const addProtectionMetaTags = () => {
      const metaTags = [
        { name: 'robots', content: 'noindex, nofollow, noarchive, nosnippet' },
        { name: 'referrer', content: 'no-referrer' },
        { httpEquiv: 'X-Frame-Options', content: 'DENY' },
        { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
        { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' }
      ];
      
      metaTags.forEach(tag => {
        const meta = document.createElement('meta');
        if (tag.name) meta.name = tag.name;
        if (tag.httpEquiv) meta.httpEquiv = tag.httpEquiv;
        meta.content = tag.content;
        document.head.appendChild(meta);
      });
    };

    addProtectionMetaTags();

    // Cleanup function
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, [enabled]);

  return null; // This component doesn't render anything
}
