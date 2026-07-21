import type { Metadata } from "next"
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google"

import "./globals.css"
import { AppShell } from "@/components/layout/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" })
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono" })

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
      className={cn("antialiased", mono.variable, inter.variable, heading.variable)}
    >
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
