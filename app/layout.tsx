import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { JsonLd } from "@/components/JsonLd";
import { FloatingCTA } from "@/components/FloatingCTA";
import { ChatWidget } from "@/components/ChatWidget";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import { siteConfig } from "@/lib/site";
import { ThemeProvider } from "@/components/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  metadataBase: new URL(siteConfig.url),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@excelprowashers",
  },
  verification: {
    google: "google-site-verification=YOUR_VERIFICATION_CODE",
  },
  other: {
    "geo.region": "CA-ON",
    "geo.placename": "Ottawa",
    "geo.position": "45.4215;-75.6972",
    "ICBM": "45.4215, -75.6972",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <JsonLd />
          <div className="flex flex-col min-h-screen">
            <AnnouncementBanner />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
            <FloatingCTA />
            <ChatWidget />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
