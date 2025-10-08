import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/session-provider";

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
  openGraph: {
    title: "Nexariq Developer Portal",
    description: "Secure API access and management for Lynxa Pro AI model",
    url: "https://nexariq.com",
    siteName: "Nexariq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nexariq Developer Portal",
    description: "Secure API access and management for Lynxa Pro AI model",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
