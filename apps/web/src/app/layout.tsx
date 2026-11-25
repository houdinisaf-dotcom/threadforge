import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "sonner";
import { ClerkProvider } from "@clerk/nextjs";
import { isDemoMode } from "@/lib/env";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "ThreadForge", template: "%s | ThreadForge" },
  description: "The mockup platform built for clothing brands.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  openGraph: {
    title: "ThreadForge",
    description: "The mockup platform built for clothing brands.",
    url: "/",
    siteName: "ThreadForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ThreadForge",
    description: "The mockup platform built for clothing brands.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const body = (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );

  // Without a publishable key ClerkProvider throws, so demo mode renders the
  // same shell without it and the app works with zero configuration.
  return isDemoMode ? body : <ClerkProvider>{body}</ClerkProvider>;
}
