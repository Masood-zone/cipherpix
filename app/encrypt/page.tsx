import type { Metadata } from "next"

import { EncryptionWorkflow } from "@/components/cipherpix/encryption-workflow"
import { PageHero } from "@/components/cipherpix/ui"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Encrypt Any File Locally",
  description:
    "Encrypt documents, images, PDFs, archives, media, code, and other file bytes locally with Caesar Cipher and Rail Fence.",
  path: "/encrypt",
})

export default function EncryptPage() {
  return (
    <>
      <PageHero
        eyebrow="Local academic tool"
        title="Encrypt a File"
        description="Choose any file format, transform its original bytes with Caesar substitution and Rail Fence transposition, then download a versioned .cpx package."
      />
      <section className="page-container pb-12">
        <EncryptionWorkflow />
      </section>
    </>
  )
}
