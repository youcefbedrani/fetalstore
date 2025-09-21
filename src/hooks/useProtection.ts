'use client';

import { useEffect, useCallback } from 'react';

interface ProtectionConfig {
  disableRightClick?: boolean;
  disableTextSelection?: boolean;
  disableKeyboardShortcuts?: boolean;
  disableDrag?: boolean;
  disableImageDrag?: boolean;
  disablePrint?: boolean;
  showWarning?: boolean;
  warningMessage?: string;
}

const defaultConfig: ProtectionConfig = {
  disableRightClick: true,
  disableTextSelection: true,
  disableKeyboardShortcuts: true,
  disableDrag: true,
  disableImageDrag: true,
  disablePrint: true,
  showWarning: true,
  warningMessage: 'This content is protected. Copying is not allowed.',
};

export const useProtection = (config: ProtectionConfig = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  // Disable right-click context menu
  const handleContextMenu = useCallback((e: MouseEvent) => {
    if (finalConfig.disableRightClick) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  }, [finalConfig.disableRightClick]);

  // Disable text selection
  const handleSelectStart = useCallback((e: Event) => {
    if (finalConfig.disableTextSelection) {
      e.preventDefault();
      return false;
    }
  }, [finalConfig.disableTextSelection]);

  // Disable drag
  const handleDragStart = useCallback((e: DragEvent) => {
    if (finalConfig.disableDrag) {
      e.preventDefault();
      return false;
    }
  }, [finalConfig.disableDrag]);

  // Disable image drag
  const handleImageDrag = useCallback((e: Event) => {
    if (finalConfig.disableImageDrag) {
      e.preventDefault();
      return false;
    }
  }, [finalConfig.disableImageDrag]);

  // Disable keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!finalConfig.disableKeyboardShortcuts) return;

    const { key, ctrlKey, shiftKey, altKey, metaKey } = e;
    
    // Disable common shortcuts
    const disabledShortcuts = [
      // Copy, Cut, Paste
      { key: 'c', ctrl: true },
      { key: 'x', ctrl: true },
      { key: 'v', ctrl: true },
      { key: 'a', ctrl: true }, // Select all
      
      // Save
      { key: 's', ctrl: true },
      { key: 's', meta: true },
      
      // Print
      { key: 'p', ctrl: true },
      { key: 'p', meta: true },
      
      // Find
      { key: 'f', ctrl: true },
      { key: 'f', meta: true },
      
      // View source
      { key: 'u', ctrl: true },
      
      // Developer tools (multiple combinations)
      { key: 'i', ctrl: true, shift: true },
      { key: 'j', ctrl: true, shift: true },
      { key: 'c', ctrl: true, shift: true },
      { key: 'I', ctrl: true, shift: true },
      { key: 'J', ctrl: true, shift: true },
      { key: 'C', ctrl: true, shift: true },
      
      // F12 (Developer tools)
      { key: 'F12' },
      
      // Alt combinations
      { key: 'F4', alt: true },
      
      // Function keys
      { key: 'F5' }, // Refresh
      { key: 'F11' }, // Fullscreen
      { key: 'F12' }, // Developer tools
      
      // Other shortcuts
      { key: 'Tab', ctrl: true },
      { key: 'Tab', shift: true },
      
      // Additional developer tools combinations
      { key: 'F12' },
      { key: 'F11' },
      { key: 'F10' },
      { key: 'F9' },
      
      // Right-click alternatives
      { key: 'ContextMenu' },
      
      // Additional inspection shortcuts
      { key: 'k', ctrl: true, shift: true },
      { key: 'K', ctrl: true, shift: true },
    ];

    const isDisabled = disabledShortcuts.some(shortcut => {
      return key === shortcut.key &&
             (shortcut.ctrl ? ctrlKey : true) &&
             (shortcut.shift ? shiftKey : !shortcut.shift) &&
             (shortcut.alt ? altKey : !shortcut.alt) &&
             (shortcut.meta ? metaKey : !shortcut.meta);
    });

    if (isDisabled) {
      e.preventDefault();
      e.stopPropagation();
      
      if (finalConfig.showWarning) {
        console.warn(finalConfig.warningMessage);
      }
      
      return false;
    }
  }, [finalConfig.disableKeyboardShortcuts, finalConfig.showWarning, finalConfig.warningMessage]);

  // Disable print
  const handleBeforePrint = useCallback((e: Event) => {
    if (finalConfig.disablePrint) {
      e.preventDefault();
      return false;
    }
  }, [finalConfig.disablePrint]);

  // Disable text selection via CSS
  const addProtectionStyles = useCallback(() => {
    const style = document.createElement('style');
    style.id = 'protection-styles';
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      input, textarea, [contenteditable] {
        -webkit-user-select: text !important;
        -moz-user-select: text !important;
        -ms-user-select: text !important;
        user-select: text !important;
      }
      
      img {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
        pointer-events: none !important;
      }
      
      body {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* Disable text selection on specific elements */
      .no-select {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* Disable image dragging */
      img, picture, video, canvas, svg {
        -webkit-user-drag: none !important;
        -khtml-user-drag: none !important;
        -moz-user-drag: none !important;
        -o-user-drag: none !important;
        user-drag: none !important;
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
  }, []);

  // Remove protection styles
  const removeProtectionStyles = useCallback(() => {
    const existingStyle = document.getElementById('protection-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  }, []);

  // Developer tools detection
  const detectDevTools = useCallback(() => {
    let devtools = false;
    const threshold = 160;
    
    // Method 1: Window size detection
    const checkWindowSize = () => {
      if (window.outerHeight - window.innerHeight > threshold || 
          window.outerWidth - window.innerWidth > threshold) {
        if (!devtools) {
          devtools = true;
          console.clear();
          console.log('%c🚫 Developer Tools Detected!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cThis website is protected. Developer tools are not allowed.', 'color: red; font-size: 20px;');
          console.log('%cPlease close developer tools to continue.', 'color: orange; font-size: 16px;');
          
          if (finalConfig.showWarning) {
            alert('🚫 Developer tools detected! This website is protected. Please close developer tools to continue.');
          }
        }
      } else {
        devtools = false;
      }
    };
    
    // Method 2: Console detection
    let devtoolsOpen = false;
    const checkConsole = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          console.clear();
          console.log('%c🚫 Debugger Detected!', 'color: red; font-size: 50px; font-weight: bold;');
          console.log('%cThis website is protected. Debugging is not allowed.', 'color: red; font-size: 20px;');
          
          if (finalConfig.showWarning) {
            alert('🚫 Debugger detected! This website is protected.');
          }
        }
      } else {
        devtoolsOpen = false;
      }
    };
    
    // Start monitoring
    setInterval(checkWindowSize, 500);
    setInterval(checkConsole, 1000);
    
    // Method 3: Disable common dev tools shortcuts
    const disableDevTools = (e: KeyboardEvent) => {
      // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        console.clear();
        console.log('%c🚫 Developer Tools Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
        return false;
      }
      
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        e.stopPropagation();
        console.clear();
        console.log('%c🚫 F12 Blocked!', 'color: red; font-size: 30px; font-weight: bold;');
        return false;
      }
    };
    
    document.addEventListener('keydown', disableDevTools, { capture: true });
    
    // Cleanup function
    return () => {
      document.removeEventListener('keydown', disableDevTools, { capture: true });
    };
  }, [finalConfig.showWarning]);

  // Initialize protection
  useEffect(() => {
    // Add CSS protection
    addProtectionStyles();
    
    // Start developer tools detection
    const cleanupDevTools = detectDevTools();

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu, { capture: true });
    document.addEventListener('selectstart', handleSelectStart, { capture: true });
    document.addEventListener('dragstart', handleDragStart, { capture: true });
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('beforeprint', handleBeforePrint, { capture: true });

    // Disable image dragging
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      img.addEventListener('dragstart', handleImageDrag, { capture: true });
      img.addEventListener('drag', handleImageDrag, { capture: true });
    });

    // Disable text selection on all elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      element.addEventListener('selectstart', handleSelectStart, { capture: true });
    });

    // Cleanup function
    return () => {
      // Cleanup developer tools detection
      if (cleanupDevTools) {
        cleanupDevTools();
      }
      
      document.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      document.removeEventListener('selectstart', handleSelectStart, { capture: true });
      document.removeEventListener('dragstart', handleDragStart, { capture: true });
      document.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('beforeprint', handleBeforePrint, { capture: true });
      
      // Remove image drag listeners
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        img.removeEventListener('dragstart', handleImageDrag, { capture: true });
        img.removeEventListener('drag', handleImageDrag, { capture: true });
      });
      
      // Remove element listeners
      const allElements = document.querySelectorAll('*');
      allElements.forEach(element => {
        element.removeEventListener('selectstart', handleSelectStart, { capture: true });
      });
      
      // Remove protection styles
      removeProtectionStyles();
    };
  }, [
    handleContextMenu,
    handleSelectStart,
    handleDragStart,
    handleKeyDown,
    handleBeforePrint,
    handleImageDrag,
    addProtectionStyles,
    removeProtectionStyles,
    detectDevTools
  ]);

  // Re-apply protection when DOM changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Re-apply protection to new elements
      const newImages = document.querySelectorAll('img:not([data-protected])');
      newImages.forEach(img => {
        img.addEventListener('dragstart', handleImageDrag, { capture: true });
        img.addEventListener('drag', handleImageDrag, { capture: true });
        img.setAttribute('data-protected', 'true');
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [handleImageDrag]);

  return {
    // Methods to manually control protection
    enableProtection: () => {
      addProtectionStyles();
    },
    disableProtection: () => {
      removeProtectionStyles();
    },
    // Current protection status
    isProtected: true
  };
};
