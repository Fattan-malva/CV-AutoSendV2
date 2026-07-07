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
  metadataBase: new URL('https://cv-auto-send.vercel.app'),
  title: {
    default: 'CV-AutoSend | Kirim CV Otomatis dengan AI',
    template: '%s | CV-AutoSend',
  },
  description: 'Upload brosur lowongan kerja, AI analisis otomatis, kirim CV + email lamaran dalam 1 klik. Gratis!',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'CV-AutoSend',
    description: 'Upload brosur, AI analisis, kirim CV + email lamaran dalam 1 klik.',
    siteName: 'CV-AutoSend',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CV-AutoSend',
    description: 'Upload brosur, AI analisis, kirim CV + email lamaran dalam 1 klik.',
  },
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${outfit.variable} ${plusJakartaSans.variable} antialiased`} suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="rI7_KVJLSLI14pRvrIbFXuVJJ_Kbp5SCQnnZwDniQ2Q" />
      </head>
      <body className="min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
