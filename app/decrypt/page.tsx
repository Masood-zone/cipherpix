import type { Metadata } from "next"

import { DecryptionWorkflow } from "@/components/cipherpix/decryption-workflow"
import { PageHero } from "@/components/cipherpix/ui"

export const metadata: Metadata = { title: "Decrypt a CipherPix File" }

export default function DecryptPage() { return <><PageHero eyebrow="Local recovery tool" title="Decrypt a CipherPix File" description="Choose a .cpx package, enter the original recovery settings, and reconstruct the exact image only after SHA-256 verification." /><section className="page-container pb-12"><DecryptionWorkflow /></section></> }
