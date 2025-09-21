# Lesson 3: Add Pixel Code to Next.js Project with TypeScript

## 🎯 Learning Objectives

By the end of this lesson, you will be able to:
- Set up a Next.js project with TypeScript
- Install and configure Facebook Pixel
- Create reusable pixel utilities
- Implement pixel in Next.js app structure
- Handle client-side and server-side rendering

## 🚀 Project Setup

### Step 1: Create Next.js Project

```bash
# Create new Next.js project with TypeScript
npx create-next-app@latest my-ecommerce-store --typescript --tailwind --eslint --app

# Navigate to project directory
cd my-ecommerce-store

# Install additional dependencies
npm install @types/node
```

### Step 2: Project Structure

```
my-ecommerce-store/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── FacebookPixel.tsx
│   └── PixelProvider.tsx
├── lib/
│   ├── facebook-pixel.ts
│   └── types.ts
├── public/
└── package.json
```

## 📦 Installing Dependencies

### Core Dependencies

```bash
# Install Facebook Pixel SDK
npm install react-facebook-pixel

# Install additional utilities
npm install @types/react-facebook-pixel
```

### Alternative: Manual Implementation

If you prefer manual implementation:

```bash
# No additional packages needed
# We'll implement pixel manually for better control
```

## 🔧 TypeScript Configuration

### Create Types File

```typescript
// lib/types.ts
export interface FacebookPixelEvent {
  eventName: string;
  parameters?: Record<string, any>;
}

export interface FacebookPixelConfig {
  pixelId: string;
  debug?: boolean;
  autoPageView?: boolean;
}

export interface EcommerceEvent {
  value?: number;
  currency?: string;
  content_ids?: string[];
  content_type?: string;
  content_name?: string;
  content_category?: string;
  num_items?: number;
}
```

## 🎯 Facebook Pixel Implementation

### Step 1: Create Pixel Utility

```typescript
// lib/facebook-pixel.ts
declare global {
  interface Window {
    fbq: any;
  }
}

class FacebookPixel {
  private pixelId: string;
  private isInitialized: boolean = false;

  constructor(pixelId: string) {
    this.pixelId = pixelId;
  }

  // Initialize the pixel
  public init(): void {
    if (typeof window === 'undefined') return;
    
    if (this.isInitialized) return;

    // Load Facebook Pixel script
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Initialize pixel
    script.onload = () => {
      window.fbq('init', this.pixelId);
      window.fbq('track', 'PageView');
      this.isInitialized = true;
    };
  }

  // Track custom events
  public track(eventName: string, parameters?: Record<string, any>): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;
    
    window.fbq('track', eventName, parameters);
  }

  // Track page view
  public trackPageView(): void {
    if (typeof window === 'undefined' || !this.isInitialized) return;
    
    window.fbq('track', 'PageView');
  }

  // Track e-commerce events
  public trackPurchase(value: number, currency: string = 'USD', parameters?: Record<string, any>): void {
    this.track('Purchase', {
      value,
      currency,
      ...parameters
    });
  }

  public trackAddToCart(value: number, currency: string = 'USD', parameters?: Record<string, any>): void {
    this.track('AddToCart', {
      value,
      currency,
      ...parameters
    });
  }

  public trackViewContent(contentId: string, value?: number, currency: string = 'USD'): void {
    this.track('ViewContent', {
      content_ids: [contentId],
      content_type: 'product',
      value,
      currency
    });
  }

  public trackInitiateCheckout(value: number, currency: string = 'USD', parameters?: Record<string, any>): void {
    this.track('InitiateCheckout', {
      value,
      currency,
      ...parameters
    });
  }
}

// Create singleton instance
let pixelInstance: FacebookPixel | null = null;

export const initFacebookPixel = (pixelId: string): FacebookPixel => {
  if (!pixelInstance) {
    pixelInstance = new FacebookPixel(pixelId);
  }
  return pixelInstance;
};

export const getFacebookPixel = (): FacebookPixel | null => {
  return pixelInstance;
};
```

### Step 2: Create React Component

```typescript
// components/FacebookPixel.tsx
'use client';

import { useEffect } from 'react';
import { initFacebookPixel } from '@/lib/facebook-pixel';

interface FacebookPixelProps {
  pixelId: string;
  debug?: boolean;
}

export default function FacebookPixel({ pixelId, debug = false }: FacebookPixelProps) {
  useEffect(() => {
    if (!pixelId) return;

    const pixel = initFacebookPixel(pixelId);
    pixel.init();

    // Enable debug mode in development
    if (debug && process.env.NODE_ENV === 'development') {
      console.log('Facebook Pixel initialized with ID:', pixelId);
    }
  }, [pixelId, debug]);

  return null; // This component doesn't render anything
}
```

### Step 3: Create Pixel Provider

```typescript
// components/PixelProvider.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { getFacebookPixel } from '@/lib/facebook-pixel';

interface PixelContextType {
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackPurchase: (value: number, currency?: string, parameters?: Record<string, any>) => void;
  trackAddToCart: (value: number, currency?: string, parameters?: Record<string, any>) => void;
  trackViewContent: (contentId: string, value?: number, currency?: string) => void;
  trackInitiateCheckout: (value: number, currency?: string, parameters?: Record<string, any>) => void;
}

const PixelContext = createContext<PixelContextType | null>(null);

export const usePixel = () => {
  const context = useContext(PixelContext);
  if (!context) {
    throw new Error('usePixel must be used within a PixelProvider');
  }
  return context;
};

interface PixelProviderProps {
  children: ReactNode;
}

export default function PixelProvider({ children }: PixelProviderProps) {
  const pixel = getFacebookPixel();

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    pixel?.track(eventName, parameters);
  };

  const trackPurchase = (value: number, currency: string = 'USD', parameters?: Record<string, any>) => {
    pixel?.trackPurchase(value, currency, parameters);
  };

  const trackAddToCart = (value: number, currency: string = 'USD', parameters?: Record<string, any>) => {
    pixel?.trackAddToCart(value, currency, parameters);
  };

  const trackViewContent = (contentId: string, value?: number, currency: string = 'USD') => {
    pixel?.trackViewContent(contentId, value, currency);
  };

  const trackInitiateCheckout = (value: number, currency: string = 'USD', parameters?: Record<string, any>) => {
    pixel?.trackInitiateCheckout(value, currency, parameters);
  };

  return (
    <PixelContext.Provider value={{
      trackEvent,
      trackPurchase,
      trackAddToCart,
      trackViewContent,
      trackInitiateCheckout
    }}>
      {children}
    </PixelContext.Provider>
  );
}
```

## 🏗️ App Integration

### Step 1: Update Root Layout

```typescript
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import FacebookPixel from '@/components/FacebookPixel';
import PixelProvider from '@/components/PixelProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My E-commerce Store',
  description: 'A Next.js e-commerce store with Facebook Pixel integration',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <PixelProvider>
          <FacebookPixel 
            pixelId={process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID || ''} 
            debug={true}
          />
          {children}
        </PixelProvider>
      </body>
    </html>
  );
}
```

### Step 2: Environment Variables

```bash
# .env.local
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id_here
```

### Step 3: Create Example Page

```typescript
// app/page.tsx
'use client';

import { usePixel } from '@/components/PixelProvider';

export default function HomePage() {
  const { trackEvent, trackViewContent } = usePixel();

  const handleProductView = () => {
    trackViewContent('product_123', 29.99, 'USD');
  };

  const handleCustomEvent = () => {
    trackEvent('CustomEvent', {
      custom_parameter: 'value'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          My E-commerce Store
        </h1>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Sample Product</h2>
          <p className="text-gray-600 mb-4">Price: $29.99</p>
          
          <div className="space-y-2">
            <button 
              onClick={handleProductView}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
              View Product (Track Event)
            </button>
            
            <button 
              onClick={handleCustomEvent}
              className="w-full bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
            >
              Custom Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🔧 Advanced Configuration

### Server-Side Rendering (SSR) Considerations

```typescript
// lib/facebook-pixel.ts - Add SSR support
export const trackServerSideEvent = async (
  pixelId: string,
  eventName: string,
  parameters?: Record<string, any>
) => {
  // Server-side tracking implementation
  // This would typically use Conversions API
  console.log('Server-side event:', eventName, parameters);
};
```

### Cookie Consent Integration

```typescript
// components/CookieConsent.tsx
'use client';

import { useState, useEffect } from 'react';
import { getFacebookPixel } from '@/lib/facebook-pixel';

export default function CookieConsent() {
  const [consent, setConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      setConsent(savedConsent === 'true');
    }
  }, []);

  const handleAccept = () => {
    setConsent(true);
    localStorage.setItem('cookie-consent', 'true');
    
    // Initialize pixel after consent
    const pixel = getFacebookPixel();
    if (pixel) {
      pixel.init();
    }
  };

  const handleDecline = () => {
    setConsent(false);
    localStorage.setItem('cookie-consent', 'false');
  };

  if (consent !== null) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <p>We use cookies to improve your experience and track analytics.</p>
        <div className="flex space-x-4">
          <button 
            onClick={handleDecline}
            className="px-4 py-2 border border-white rounded"
          >
            Decline
          </button>
          <button 
            onClick={handleAccept}
            className="px-4 py-2 bg-blue-500 rounded hover:bg-blue-600"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
```

## 🧪 Testing Your Implementation

### Development Testing

```typescript
// Add to your component for testing
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Facebook Pixel loaded:', !!window.fbq);
  }
}, []);
```

### Production Verification

1. **Check Network Tab**: Look for requests to `facebook.com`
2. **Use Meta Pixel Helper**: Install browser extension
3. **Check Events Manager**: Verify events in real-time

## 📋 Checklist

Before moving to the next lesson, ensure you have:

- ✅ Next.js project created with TypeScript
- ✅ Facebook Pixel utility implemented
- ✅ React components created
- ✅ App layout updated
- ✅ Environment variables set
- ✅ Basic tracking working

## 🚀 Next Steps

In the next lesson, we'll implement specific e-commerce events like page views, add-to-cart, and purchases.

---

**Ready for Lesson 4?** [Track Page Views, Add-to-Cart, and Purchase Events →](./lesson-4-ecommerce-events.md)
