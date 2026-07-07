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
    default: 'Ceefy - Kirim CV Otomatis dengan AI ke Setiap Lowongan Kerja',
    template: '%s | ceefy',
  },
  description: 'Kirim CV otomatis dengan AI ke setiap lowongan kerja. Upload brosur, AI analisis otomatis, kirim email lamaran dalam 1 klik. Solusi job seeker cerdas untuk aplikasi kerja cepat dan personal.',
  keywords: ['CV', 'kirim CV otomatis', 'lamaran kerja', 'job application', 'AI recruitment', 'job seeker', 'cari kerja', 'lowongan', 'aplikasi lowongan kerja', 'otomatis kirim email', 'ceefy'],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'ceefy - Kirim CV Otomatis dengan AI',
    description: 'Upload brosur, AI analisis otomatis, kirim CV + email lamaran dalam 1 klik. Dibuat untuk job seeker Indonesia.',
    siteName: 'ceefy',
    locale: 'id_ID',
    type: 'website',
    url: 'https://ceefy.mallvaa.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ceefy - Kirim CV Otomatis dengan AI',
    description: 'Upload brosur, AI analisis, kirim CV + email lamaran dalam 1 klik. Solusi cerdas job seeker.',
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
    <html lang="id" className={`${outfit.variable} ${plusJakartaSans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="xgzeigl6YoKgRyfWu9ZPM4xn0OY4ApfTzcfb7FBKIwY" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "ceefy",
              "applicationCategory": "JobApplication",
              "operatingSystem": "Web",
              "url": "https://ceefy.mallvaa.xyz/",
              "description": "Kirim CV otomatis dengan AI ke setiap lowongan kerja. Upload brosur, AI analisis, kirim email lamaran dalam 1 klik.",
              "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ceefy",
              "url": "https://ceefy.mallvaa.xyz/",
              "description": "Aplikasi AI untuk membantu job seeker mengirim CV otomatis",
              "inLanguage": ["id", "en"]
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
