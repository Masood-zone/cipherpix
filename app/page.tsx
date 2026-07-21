import Link from "next/link"
import type { Metadata } from "next"
import {
  Binary,
  FileArchive,
  // GraduationCap,
  HardDrive,
  KeyRound,
  ShieldCheck,
} from "lucide-react"

import {
  FeatureCard,
  Journey,
  Notice,
  PageHero,
} from "@/components/cipherpix/ui"
import { StructuredData } from "@/components/seo/structured-data"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "How CipherPix Works",
  description:
    "Learn how CipherPix transforms original image bytes with Caesar Cipher and Rail Fence algorithms, packages them as .cpx files, and verifies recovery with SHA-256.",
  path: "/",
})

export default function HowItWorksPage() {
  return (
    <>
      <StructuredData />
      <PageHero
        eyebrow="Start here"
        title="Understand CipherPix Before You Begin"
        description="CipherPix demonstrates how original image-file bytes can be changed and rearranged using Caesar Cipher and Rail Fence algorithms."
        centered
      >
        <Link href="/encrypt" className="link-button">
          Encrypt an Image
        </Link>
        <Link href="/decrypt" className="link-button-outline">
          Decrypt a File
        </Link>
        <Link href="/algorithms" className="link-button-outline">
          Explore Algorithms
        </Link>
      </PageHero>

      <section className="page-container section-space pt-6">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard icon={Binary} title="Image bytes">
            PNG, JPEG, WEBP and BMP files are sequences of byte values from 0 to
            255. CipherPix transforms the complete original file, not only
            visible pixels.
          </FeatureCard>
          <FeatureCard icon={KeyRound} title="Two classical operations">
            Caesar changes each byte value. Rail Fence keeps the values but
            rearranges their positions in a repeatable zigzag pattern.
          </FeatureCard>
          <FeatureCard icon={FileArchive} title="The .cpx container">
            A versioned binary package holds non-secret file metadata, the
            SHA-256 checksum and encrypted payload. It cannot be opened as a
            normal image.
          </FeatureCard>
        </div>
      </section>

      <section className="bg-card py-14">
        <div className="page-container">
          <span className="eyebrow">Encryption journey</span>
          <h2 className="mt-4 mb-7 text-3xl font-bold">
            From image to CipherPix package
          </h2>
          <Journey
            steps={[
              "Choose Image",
              "Read Image Bytes",
              "Apply Caesar Transformation",
              "Apply Rail Fence Rearrangement",
              "Build .cpx Package",
              "Download",
            ]}
          />
        </div>
      </section>

      <section className="page-container section-space">
        <span className="eyebrow">Decryption journey</span>
        <h2 className="mt-4 mb-7 text-3xl font-bold">
          Rebuild and verify the original
        </h2>
        <Journey
          steps={[
            "Choose .cpx File",
            "Reverse Rail Fence",
            "Reverse Caesar Transformation",
            "Reconstruct Image",
            "Verify Integrity",
            "Download Original",
          ]}
        />
      </section>

      <section className="page-container grid gap-5 pb-14 md:grid-cols-2">
        <FeatureCard
          icon={ShieldCheck}
          title="How integrity verification works"
        >
          Before encryption, CipherPix calculates a SHA-256 fingerprint of the
          original bytes. After reversing the transformation, it calculates the
          fingerprint again. A verified result means the two values actually
          match.
        </FeatureCard>
        <FeatureCard icon={HardDrive} title="Private by designS">
          Files, recovered images and keys stay in this browser. Only
          non-sensitive activity summaries and preferences may be stored
          locally. No file is sent to a server.
        </FeatureCard>
        <div className="md:col-span-2">
          <Notice tone="warning" title="Save your recovery settings">
            The Caesar key changes byte values and the Rail Fence value changes
            positions. Neither value is stored inside the `.cpx` package.
            Download the separate recovery note and keep it safe—anyone with
            both files can recover the image.
          </Notice>
        </div>
        {/* <div className="md:col-span-2">
          <Notice title="Academic demonstration">
            <span className="inline-flex items-center gap-2">
              <GraduationCap className="size-4" />
              CipherPix demonstrates classical cryptographic principles. It is
              not a replacement for modern standards such as AES and must not
              protect sensitive real-world information.
            </span>
          </Notice>
        </div> */}
      </section>
    </>
  )
}
