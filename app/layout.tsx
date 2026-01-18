import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mundial Hub 2026",
  description: "PWA social y gamificada para el Mundial 2026. Prode, minijuegos diarios y más.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mundial Hub",
  },
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#71dbd2",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { PWAUpdater } from "@/components/PWAUpdater";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        {/* Mobile-first container */}
        <div className="mx-auto max-w-[500px] min-h-screen bg-background shadow-2xl shadow-primary/5 relative">
          {/* Subtle gradient border effect */}
          <div className="absolute inset-0 bg-linear-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

          {/* Main content */}
          <main className="relative flex-1 pb-20">
            {children}
          </main>

          {/* Navigation */}
          <BottomNav />
          <PWAUpdater />
        </div>
      </body>
    </html>
  );
}
