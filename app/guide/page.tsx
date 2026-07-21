import type { Metadata } from "next"
import { Download, FileUp, KeyRound, ShieldCheck } from "lucide-react"

import { FeatureCard, Notice, PageHero } from "@/components/cipherpix/ui"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "CipherPix User Guide",
  description:
    "Step-by-step instructions for encrypting files, saving recovery settings, importing recovery notes, decrypting .cpx packages, and resolving common errors.",
  path: "/guide",
})

const sections = [
  [
    FileUp,
    "1. Choose a file",
    "Open Encrypt and select any non-empty file up to your configured size limit. This includes DOCX, DOC, TXT, PDF, images, archives, audio, video, code, and other formats.",
  ],
  [
    KeyRound,
    "2. Save recovery settings",
    "Use the generated Caesar key and rail count or choose valid values. Copy them or download the separate recovery note before processing.",
  ],
  [
    Download,
    "3. Encrypt and download",
    "Confirm that the settings are saved. CipherPix hashes, transforms, packages, reverses and verifies the data before enabling the .cpx download.",
  ],
  [
    ShieldCheck,
    "4. Recover the original",
    "Open Decrypt, choose the .cpx file, enter the same values or import the recovery note, then decrypt. Download is enabled only after SHA-256 succeeds.",
  ],
] as const

export default function GuidePage() {
  return (
    <>
      <PageHero
        eyebrow="Help center"
        title="CipherPix User Guide"
        description="Plain-language instructions for encrypting, saving recovery settings, decrypting and resolving common problems."
      />
      <section className="page-container grid gap-5 pb-12 md:grid-cols-2">
        {sections.map(([Icon, title, copy]) => (
          <FeatureCard key={title} icon={Icon} title={title}>
            {copy}
          </FeatureCard>
        ))}
      </section>
      <section className="page-container space-y-4 pb-12">
        <h2 className="text-3xl font-bold">Common errors</h2>
        <details className="surface-card">
          <summary className="font-semibold">My file is rejected</summary>
          <p className="mt-3 text-muted-foreground">
            Check that the file is non-empty and below the configured size
            limit. CipherPix accepts any file format, even when the browser does
            not report a MIME type.
          </p>
        </details>
        <details className="surface-card">
          <summary className="font-semibold">
            Integrity verification failed
          </summary>
          <p className="mt-3 text-muted-foreground">
            The Caesar key or rail value is probably wrong, or the package has
            been changed. CipherPix will not create a corrupted preview or
            download.
          </p>
        </details>
        <details className="surface-card">
          <summary className="font-semibold">
            My result disappeared after refresh
          </summary>
          <p className="mt-3 text-muted-foreground">
            Binary results live only in memory. Repeat the operation; this
            behavior prevents file data and keys from being persisted locally.
          </p>
        </details>
      </section>
      <section className="page-container pb-12">
        <Notice title="Privacy answer">
          All file processing remains in the browser. CipherPix has no upload
          endpoint, account, database, cloud file store, analytics tracker, or
          third-party processing service.
        </Notice>
      </section>
    </>
  )
}
