// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/session-provider";
import ErrorBoundary from "@/components/error-boundary";
import { ThemeProvider } from "@/components/theme-provider";
import { DevSessionProvider } from "@/components/dev-session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nexariq Developer Portal",
  description: "Secure API access, key management, and analytics for Lynxa Pro AI model",
  keywords: ["Nexariq", "Lynxa Pro", "AI", "API", "Developer Portal", "Authentication", "Analytics"],
  authors: [{ name: "Nexariq - AJ STUDIOZ" }],
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Nexariq Developer Portal",
    description: "Secure API access and management for Lynxa Pro AI model",
    url: "https://nexariq-07.vercel.app",
    siteName: "Nexariq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexariq Developer Portal",
    description: "Secure API access and management for Lynxa Pro AI model",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
      >
        <ErrorBoundary>
          <ThemeProvider>
            <DevSessionProvider>
              <Providers>
                {children}
                <Toaster />
              </Providers>
            </DevSessionProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
