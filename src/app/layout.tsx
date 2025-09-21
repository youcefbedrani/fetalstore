import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ProtectionProvider } from "@/components/ProtectionProvider";

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
          {children}
        </ProtectionProvider>
      </body>
    </html>
  );
}
