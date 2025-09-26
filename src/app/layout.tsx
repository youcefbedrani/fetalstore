import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProtectionProvider } from "@/components/ProtectionProvider";
import VisitorTracker from "@/components/VisitorTracker";
import ScreenshotProtection from "@/components/ScreenshotProtection";
import AdvancedScreenshotProtection from "@/components/AdvancedScreenshotProtection";
import VisualScreenshotProtection from "@/components/VisualScreenshotProtection";
import MobileScreenshotProtection from "@/components/MobileScreenshotProtection";
import EnhancedMobileProtection from "@/components/EnhancedMobileProtection";
import UltimateScreenshotProtection from "@/components/UltimateScreenshotProtection";
import MobileHardwareProtection from "@/components/MobileHardwareProtection";
import UltimatePixelBypass from "@/components/UltimatePixelBypass";
import PixelMode from "@/components/PixelMode";
import DeveloperToolsProtection from "@/components/DeveloperToolsProtection";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "أجمل ذكرياتك داخل كرة كريستالية مضيئة – هدية تبقى للأبد",
  description: "هل تبحث عن هدية مختلفة فعلاً؟ الكرة الكريستالية المضيئة تحول لحظاتك الثمينة إلى عمل فني يضيء كل زاوية من منزلك. صورة مخصصة مجانية، قاعدة خشبية أنيقة، ونقش أساسي مجاني. مناسبة للاحتفال بالمولود الجديد، الذكريات العائلية، أو كهدية مليئة بالحب لشخص عزيز. إنها ليست مجرد هدية… إنها ذكرى خالدة ستبقى للأبد.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        {/* Meta Pixel Code - Bypass Protection */}
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  // FORCE LOAD PIXEL - BYPASS ALL BLOCKING
                  (function() {
                    try {
                      console.log('🚀 Starting FORCE pixel load...');
                      
                      // Method 1: Direct script injection
                      var script = document.createElement('script');
                      script.type = 'text/javascript';
                      script.async = false;
                      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
                      script.onload = function() {
                        console.log('✅ Facebook script loaded successfully');
                        
                        // Initialize pixel immediately
                        if (typeof fbq !== 'undefined') {
                          fbq('init', '24528287270184892');
                          fbq('track', 'PageView');
                          console.log('✅ Pixel initialized and PageView sent');
                        } else {
                          console.error('❌ fbq function not available after script load');
                        }
                      };
                      script.onerror = function() {
                        console.error('❌ Failed to load Facebook script');
                        
                        // Method 2: Try alternative loading
                        setTimeout(function() {
                          var script2 = document.createElement('script');
                          script2.type = 'text/javascript';
                          script2.async = true;
                          script2.src = 'https://connect.facebook.net/en_US/fbevents.js';
                          document.head.appendChild(script2);
                        }, 1000);
                      };
                      
                      document.head.appendChild(script);
                      
                      // Method 3: Facebook's official pixel code as backup
                      setTimeout(function() {
                        if (typeof fbq === 'undefined') {
                          console.log('🔄 Trying Facebook official pixel code...');
                          !function(f,b,e,v,n,t,s)
                          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                          n.queue=[];t=b.createElement(e);t.async=!0;
                          t.src=v;s=b.getElementsByTagName(e)[0];
                          s.parentNode.insertBefore(t,s)}(window, document,'script',
                          'https://connect.facebook.net/en_US/fbevents.js');
                          
                          // Initialize after a delay
                          setTimeout(function() {
                            if (typeof fbq !== 'undefined') {
                              fbq('init', '24528287270184892');
                              fbq('track', 'PageView');
                              console.log('✅ Pixel initialized via backup method');
                            }
                          }, 2000);
                        }
                      }, 3000);
                      
                    } catch (error) {
                      console.error('❌ Pixel setup failed:', error);
                    }
                  })();
                `,
              }}
            />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=24528287270184892&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
            <ProtectionProvider
              config={{
                disableRightClick: true,
                disableTextSelection: true,
                disableKeyboardShortcuts: true,
                disableDrag: true,
                disableImageDrag: true,
                disablePrint: true,
                showWarning: true,
                warningMessage: 'هذا المحتوى محمي. النسخ غير مسموح.'
              }}
              enableInProduction={true}
            >
          <UltimatePixelBypass />
          <PixelMode />
          <DeveloperToolsProtection />
          <VisitorTracker />
          <ScreenshotProtection enabled={false} />
          <AdvancedScreenshotProtection enabled={false} />
          <VisualScreenshotProtection enabled={false} />
          <MobileScreenshotProtection enabled={false} />
          <EnhancedMobileProtection enabled={false} />
          <UltimateScreenshotProtection enabled={false} />
          <MobileHardwareProtection enabled={false} />
          {children}
        </ProtectionProvider>
      </body>
    </html>
  );
}
