'use client';

import React, { useEffect } from 'react';
import { useProtection } from '@/hooks/useProtection';

interface PageProtectionProps {
  children: React.ReactNode;
  disableRightClick?: boolean;
  disableTextSelection?: boolean;
  disableKeyboardShortcuts?: boolean;
  disableDrag?: boolean;
  disableImageDrag?: boolean;
  disablePrint?: boolean;
  showWarning?: boolean;
  warningMessage?: string;
  className?: string;
}

export const PageProtection: React.FC<PageProtectionProps> = ({
  children,
  disableRightClick = true,
  disableTextSelection = true,
  disableKeyboardShortcuts = true,
  disableDrag = true,
  disableImageDrag = true,
  disablePrint = true,
  showWarning = true,
  warningMessage = 'This content is protected. Copying is not allowed.',
  className = ''
}) => {
  useProtection({
    disableRightClick,
    disableTextSelection,
    disableKeyboardShortcuts,
    disableDrag,
    disableImageDrag,
    disablePrint,
    showWarning,
    warningMessage
  });

  // Add protection class to the wrapper
  useEffect(() => {
    const wrapper = document.getElementById('page-protection-wrapper');
    if (wrapper) {
      wrapper.classList.add('protected-content');
    }
  }, []);

  return (
    <div 
      id="page-protection-wrapper"
      className={`page-protection ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      {children}
    </div>
  );
};

// Lightweight protection for specific elements
export const ElementProtection: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`element-protection ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        ...style
      } as React.CSSProperties}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {children}
    </div>
  );
};

// Protection for images specifically
export const ImageProtection: React.FC<{
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}> = ({ src, alt, className = '', style = {}, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`protected-image ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'none',
        ...style
      } as React.CSSProperties}
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      onDrag={(e) => e.preventDefault()}
      draggable={false}
      {...props}
    />
  );
};

// Protection for text content
export const TextProtection: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, className = '', style = {} }) => {
  return (
    <span
      className={`protected-text ${className}`}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitTouchCallout: 'none',
        ...style
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </span>
  );
};
