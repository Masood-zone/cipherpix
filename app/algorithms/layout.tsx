import type { Metadata } from "next"

import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Interactive Algorithm Explorer",
  description:
    "Explore Caesar byte substitution, Rail Fence transposition, and their reversible hybrid workflow with interactive educational demonstrations.",
  path: "/algorithms",
})

export default function AlgorithmsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
