import type { Metadata } from "next"

import "./globals.css"
import { AppShell } from "@/components/layout/app-shell"
import { ThemeProvider } from "@/components/theme-provider"

export const metadata: Metadata = {
  title: { default: "CipherPix — Secure Every Pixel", template: "%s | CipherPix" },
  description: "A local, browser-based academic demonstration of Caesar Cipher and Rail Fence image encryption.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="antialiased"
    >
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
