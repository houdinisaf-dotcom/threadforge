import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ThreadForge", template: "%s | ThreadForge" },
  description: "The mockup platform built for clothing brands.",
  openGraph: {
    title: "ThreadForge",
    description: "The mockup platform built for clothing brands.",
    url: "https://threadforge.io",
    siteName: "ThreadForge",
    images: [{ url: "/og/og-default.png", width: 1200, height: 630 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThreadForge",
    description: "The mockup platform built for clothing brands.",
    images: ["/og/og-default.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
