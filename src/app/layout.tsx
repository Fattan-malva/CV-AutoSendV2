import type { Metadata } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://ceefy.mallvaa.xyz'),
  title: {
    default: 'Ceefy - Free AI CV Builder & Auto Job Application Sender',
    template: '%s | Ceefy',
  },
  description: 'Build ATS-friendly CVs with AI and auto-send applications to every job opening. Free AI CV builder creates professional resumes, analyzes brochures, and sends emails in one click.',
  keywords: ['CV builder', 'AI CV builder', 'free resume builder', 'ATS-friendly CV', 'auto job application sender', 'apply to jobs online', 'job search tools', 'job application automation', 'AI resume writer', 'career tools', 'find jobs online', 'ceefy'],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Ceefy - Free AI CV Builder & Auto Job Application Sender',
    description: 'Build ATS-friendly CVs with AI and auto-send applications to every job. Free AI CV builder, brochure analyzer, and one-click email sender.',
    siteName: 'Ceefy',
    locale: 'en_US',
    type: 'website',
    url: 'https://ceefy.mallvaa.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ceefy - Free AI CV Builder & Auto Job Application Sender',
    description: 'Build ATS-friendly CVs with AI and auto-send applications to every job.',
  },
  robots: 'index, follow',
  alternates: {
    canonical: 'https://ceefy.mallvaa.xyz',
    languages: {
      'id': 'https://ceefy.mallvaa.xyz',
      'en': 'https://ceefy.mallvaa.xyz/en',
      'x-default': 'https://ceefy.mallvaa.xyz',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${plusJakartaSans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="xgzeigl6YoKgRyfWu9ZPM4xn0OY4ApfTzcfb7FBKIwY" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Ceefy",
              "applicationCategory": "WebApplication",
              "operatingSystem": "Web",
              "url": "https://ceefy.mallvaa.xyz/",
              "description": "Build ATS-friendly CVs with AI and auto-send job applications. Free AI CV builder with brochure analysis and one-click email sending.",
              "applicationSuite": "Ceefy",
              "screenshot": "https://ceefy.mallvaa.xyz/og-image.png",
              "featureList": [
                "AI CV Builder with ATS-friendly templates",
                "AI-powered job brochure analysis",
                "One-click auto-send applications",
                "Multi-language CV export (PDF)"
              ],
              "offers": {
                "@type": "AggregateOffer",
                "priceCurrency": "USD",
                "lowPrice": "0",
                "highPrice": "20",
                "offerCount": "4"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Ceefy",
              "url": "https://ceefy.mallvaa.xyz/",
              "description": "Free AI CV Builder and auto job application tool. Build professional resumes, analyze brochures, and send applications globally.",
              "inLanguage": ["en", "id"]
            }
          ])
        }} />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
