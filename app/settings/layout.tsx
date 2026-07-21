import type { Metadata } from "next"

import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Local Settings",
  description:
    "Manage CipherPix appearance, encryption defaults, and local privacy preferences.",
  path: "/settings",
  index: false,
})

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
