import type { Metadata } from "next"

import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Temporary Decryption Result",
  description:
    "Download a locally reconstructed file after SHA-256 verification.",
  path: "/decrypt/result",
  canonicalPath: "/decrypt",
  index: false,
})

export default function DecryptionResultLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
