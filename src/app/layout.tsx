import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartSlideOut } from "@/components/cart/CartSlideOut";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import { ChatWidget } from "@/components/ChatWidget";
import { Analytics } from "@vercel/analytics/next";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Organic Harvest | Premium Pantry Products",
  description: "Buy premium organic pantry products in Pakistan. Pure Honey, Dates, Desi Ghee, and Canola Oil.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true} className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col font-sans`}>
        {/* Global Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Organic Harvest",
              url: "https://organicharvest.pk",
              logo: "https://placehold.co/400x400/2E472D/D4AF37.png?text=OH",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+92-300-0000000",
                contactType: "customer service",
                contactOption: "TollFree",
                areaServed: "PK",
                availableLanguage: ["English", "Urdu"]
              }
            })
          }}
        />
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
        <CartSlideOut />
        <WhatsAppWidget />
        <ChatWidget />
        <Analytics />
      </body>
    </html>
  );
}
