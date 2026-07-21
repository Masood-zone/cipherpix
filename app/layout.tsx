import type { Metadata, Viewport } from "next"

import "./globals.css"
import { AppShell } from "@/components/layout/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { siteConfig } from "@/lib/seo"

export const metadata: Metadata = {
  metadataBase: siteConfig.url,
  title: {
    default: "CipherPix — Secure Every Pixel",
    template: "%s | CipherPix",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [
    { name: siteConfig.author.name, url: "https://github.com/Masood-zone" },
  ],
  creator: siteConfig.author.name,
  publisher: siteConfig.name,
  generator: "Next.js",
  category: "education",
  keywords: [
    "image encryption",
    "Caesar Cipher",
    "Rail Fence Cipher",
    "classical cryptography",
    "browser encryption",
    "SHA-256 integrity",
    "cryptography education",
    "CipherPix",
  ],
  referrer: "strict-origin-when-cross-origin",
  formatDetection: { address: false, email: false, telephone: false },
  alternates: { canonical: "/" },
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "CipherPix — Secure Every Pixel",
    description: siteConfig.description,
    url: "/",
    siteName: siteConfig.name,
    locale: "en_GH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CipherPix — Secure Every Pixel",
    description: siteConfig.description,
  },
  robots: { index: true, follow: true },
  verification: {
    ...(process.env.GOOGLE_SITE_VERIFICATION
      ? { google: process.env.GOOGLE_SITE_VERIFICATION }
      : {}),
    ...(process.env.BING_SITE_VERIFICATION
      ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
      : {}),
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1120" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className="antialiased">
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
