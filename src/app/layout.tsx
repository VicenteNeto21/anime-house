import type { Metadata } from "next";
import { Suspense } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuthHandler from "@/components/auth/AuthHandler";
import { LibraryProvider } from "@/context/LibraryContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anime House - Assista Animes Online em Full HD",
  description: "A melhor plataforma para você assistir seus animes favoritos em alta definição com a melhor experiência otaku.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <LibraryProvider>
          <Suspense fallback={null}>
            <AuthHandler />
          </Suspense>
          <Navbar />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <Footer />
        </LibraryProvider>
      </body>
    </html>
  );
}

