'use client'

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  fill?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}

export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'blur',
  blurDataURL,
  sizes,
  fill = false,
  style,
  onClick,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority, isInView]);

  // Generate blur placeholder if not provided
  const generateBlurDataURL = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    canvas.width = w;
    canvas.height = h;
    
    // Create a simple gradient blur
    const gradient = ctx.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
    
    return canvas.toDataURL('image/jpeg', 0.1);
  };

  const defaultBlurDataURL = blurDataURL || generateBlurDataURL(width, height);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  // Show placeholder while loading
  if (!isInView) {
    return (
      <div
        ref={imgRef}
        className={`bg-gray-200 animate-pulse ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style,
        }}
        aria-label={alt}
      />
    );
  }

  // Show error state
  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        style={{
          width: fill ? '100%' : width,
          height: fill ? '100%' : height,
          ...style,
        }}
        onClick={onClick}
      >
        <div className="text-center text-gray-500">
          <svg
            className="w-8 h-8 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-xs">Failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={style}
      onClick={onClick}
    >
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        quality={quality}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={defaultBlurDataURL}
        sizes={sizes}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          objectFit: 'cover',
        }}
      />
      
      {/* Loading overlay */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}

// Preload utility for critical images
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Image optimization utilities
export const imageUtils = {
  // Generate responsive image sizes
  generateSizes: (breakpoints: { [key: string]: number }) => {
    return Object.entries(breakpoints)
      .map(([breakpoint, size]) => `(max-width: ${breakpoint}px) ${size}px`)
      .join(', ') + ', 100vw';
  },

  // Generate optimized Cloudinary URL
  getOptimizedCloudinaryUrl: (
    publicId: string,
    width: number,
    height: number,
    quality: number = 75,
    format: string = 'auto'
  ) => {
    const baseUrl = 'https://res.cloudinary.com';
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    
    if (!cloudName) return publicId;
    
    return `${baseUrl}/${cloudName}/image/upload/w_${width},h_${height},q_${quality},f_${format}/${publicId}`;
  },

  // Generate WebP URL with fallback
  getWebPUrl: (src: string, fallback: string = src) => {
    if (typeof window === 'undefined') return fallback;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx || !canvas.toBlob) return fallback;
    
    return src; // Simplified for now - in production, you'd implement WebP detection
  },
};
