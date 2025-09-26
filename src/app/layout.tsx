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
              // Load pixel BEFORE any protection systems
              (function() {
                try {
                  // Facebook's official pixel code
                  !function(f,b,e,v,n,t,s)
                  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                  n.queue=[];t=b.createElement(e);t.async=!0;
                  t.src=v;s=b.getElementsByTagName(e)[0];
                  s.parentNode.insertBefore(t,s)}(window, document,'script',
                  'https://connect.facebook.net/en_US/fbevents.js');
                  
                  // Initialize immediately
                  fbq('init', '24528287270184892');
                  fbq('track', 'PageView');
                  
                  console.log('✅ Meta Pixel loaded BEFORE protection systems');
                } catch (error) {
                  console.error('❌ Meta Pixel failed:', error);
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
                disableRightClick: false,
                disableTextSelection: false,
                disableKeyboardShortcuts: false,
                disableDrag: false,
                disableImageDrag: false,
                disablePrint: false,
                showWarning: false,
                warningMessage: ''
              }}
              enableInProduction={false}
            >
          <UltimatePixelBypass />
          <PixelMode />
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
