import type { Metadata } from "next"

import { EncryptionWorkflow } from "@/components/cipherpix/encryption-workflow"
import { PageHero } from "@/components/cipherpix/ui"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Encrypt an Image Locally",
  description:
    "Encrypt PNG, JPEG, WEBP, or BMP file bytes locally with Caesar Cipher and Rail Fence, verify integrity, and download a versioned .cpx package.",
  path: "/encrypt",
})

export default function EncryptPage() {
  return (
    <>
      <PageHero
        eyebrow="Local academic tool"
        title="Encrypt an Image"
        description="Transform the original file bytes with Caesar substitution and Rail Fence transposition, then download a versioned .cpx package."
      />
      <section className="page-container pb-12">
        <EncryptionWorkflow />
      </section>
    </>
  )
}
