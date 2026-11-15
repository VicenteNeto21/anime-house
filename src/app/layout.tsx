import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
import { Suspense } from "react";
import Script from "next/script";
import { Archivo_Black, Sora } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CookieConsent from "@/components/layout/CookieConsent";
import ConsoleEasterEgg from "@/components/ConsoleEasterEgg";

import { LibraryProvider } from "@/context/LibraryContext";
import { Providers } from "@/components/Providers";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anime House - Catálogo, Notícias e Guia de Episódios",
  description: "O seu portal definitivo para organizar, descobrir e acompanhar as melhores obras da cultura pop.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Anime House",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://graphql.anilist.co" />
      </head>
      <body className={`${sora.variable} ${archivoBlack.variable} min-h-screen flex flex-col`}>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879597043409013"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <Providers>
          <LibraryProvider>
            <ConsoleEasterEgg />
            <Navbar />
            <main className="flex-grow pt-16">
              {children}
            </main>
            <Footer />
            <CookieConsent />
          </LibraryProvider>
        </Providers>
      </body>
    </html>
  );
}
