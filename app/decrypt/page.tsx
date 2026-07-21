import type { Metadata } from "next"

import { DecryptionWorkflow } from "@/components/cipherpix/decryption-workflow"
import { PageHero } from "@/components/cipherpix/ui"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Decrypt a CipherPix File Locally",
  description:
    "Upload a .cpx package, enter recovery settings, reverse Rail Fence and Caesar transformations, and verify the recovered file with SHA-256.",
  path: "/decrypt",
})

export default function DecryptPage() {
  return (
    <>
      <PageHero
        eyebrow="Local recovery tool"
        title="Decrypt a CipherPix File"
        description="Choose a .cpx package, enter the original recovery settings, and reconstruct the exact original file only after SHA-256 verification."
      />
      <section className="page-container pb-12">
        <DecryptionWorkflow />
      </section>
    </>
  )
}
