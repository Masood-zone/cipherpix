import {
  BookOpenCheck,
  Braces,
  MonitorCheck,
  ShieldAlert,
  ShieldCheck,
  TestTube2,
} from "lucide-react"
import type { Metadata } from "next"

import { FeatureCard, PageHero } from "@/components/cipherpix/ui"
import { createPageMetadata } from "@/lib/seo"

export const metadata: Metadata = createPageMetadata({
  title: "Security & Limitations",
  description:
    "Understand CipherPix local processing, SHA-256 integrity checks, classical cipher weaknesses, and why this academic tool is not a replacement for AES.",
  path: "/security",
})

export default function SecurityPage() {
  return (
    <>
      <PageHero
        eyebrow="Disclosure & ethics"
        title="Security & Limitations"
        description="An honest account of what this academic tool provides—and what classical cryptography cannot provide."
        centered
      />
      <section className="page-container grid gap-5 pb-12 md:grid-cols-2 lg:grid-cols-3">
        <FeatureCard icon={MonitorCheck} title="Local processing">
          Original images, encrypted packages, recovery notes and reconstructed
          images are processed in your browser.
        </FeatureCard>
        <FeatureCard icon={Braces} title="Reversible transformations">
          CipherPix combines byte substitution and positional transposition in a
          documented format.
        </FeatureCard>
        <FeatureCard icon={ShieldCheck} title="Integrity checking">
          SHA-256 detects whether recovered bytes exactly match the bytes
          supplied before encryption.
        </FeatureCard>
      </section>
      {/* <section className="page-container pb-12">
        <Notice tone="warning" title="Important limitations">
          Caesar has only 255 useful shifts, rail counts are limited, image
          headers are predictable, and classical ciphers are vulnerable to brute
          force and analysis. Do not use CipherPix for banking, government,
          military, legal, medical, credential, or other sensitive data.
        </Notice>
      </section> */}
      <section className="bg-card py-14">
        <div className="page-container">
          <h2 className="text-3xl font-bold">Classical vs. modern standards</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <FeatureCard icon={TestTube2} title="CipherPix classical hybrid">
              Fast, inspectable and useful for teaching substitution,
              transposition, binary containers, and integrity checks. It does
              not provide modern confidentiality.
            </FeatureCard>
            <FeatureCard
              icon={ShieldAlert}
              title="Modern authenticated encryption"
            >
              Standards such as AES-GCM are designed to resist contemporary
              attacks and authenticate ciphertext. Use reviewed modern tools for
              real security.
            </FeatureCard>
          </div>
        </div>
      </section>
      <section className="page-container py-14">
        <FeatureCard icon={BookOpenCheck} title="Recommended uses">
          Classroom learning, academic demonstrations, cryptography experiments,
          prototype research, and exploration of reversible byte
          transformations.
        </FeatureCard>
      </section>
    </>
  )
}
