import type { Metadata } from "next"

import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Local Activity History",
  description:
    "Review non-sensitive CipherPix operation summaries stored only in this browser.",
  path: "/history",
  index: false,
})

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
