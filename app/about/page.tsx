import type { Metadata } from "next"
import { Code2, GraduationCap, ListChecks, UserRound } from "lucide-react"

import { FeatureCard, Notice, PageHero } from "@/components/cipherpix/ui"

export const metadata: Metadata = { title: "About" }

export default function AboutPage() {
  return <>
    <PageHero eyebrow="Academic project" title="CipherPix" description="CipherPix: A Hybrid Image Encryption System Using Caesar Cipher and Rail Fence Algorithms." />
    <section className="page-container grid gap-5 pb-12 md:grid-cols-2">
      <FeatureCard icon={GraduationCap} title="Aim">Develop an accessible browser application that demonstrates image-file encryption and decryption using a hybrid of two classical algorithms while preserving exact byte integrity.</FeatureCard>
      <FeatureCard icon={ListChecks} title="Objectives">Teach byte substitution and transposition, package encrypted data, separate recovery settings, reconstruct the original image, and verify the result with SHA-256.</FeatureCard>
      <FeatureCard icon={Code2} title="Included technology">Next.js, React, TypeScript, Tailwind CSS, Shadcn/UI foundations, Zustand, Web Workers, Web Crypto, File APIs, typed arrays, Blob URLs and localStorage.</FeatureCard>
      <FeatureCard icon={UserRound} title="Developer information"><strong>Mike Coffie</strong><br />Index Number: 5221040080<br />Developer and Researcher</FeatureCard>
    </section>
    <section className="page-container grid gap-5 pb-12 md:grid-cols-2"><Notice title="Included scope">Local image encryption/decryption, educational explanations, binary packaging, recovery notes, integrity verification, settings, and non-sensitive history.</Notice><Notice tone="warning" title="Excluded scope">Authentication, databases, cloud storage, mobile-native applications, AES/RSA implementation, production security, and external file processing.</Notice></section>
  </>
}
