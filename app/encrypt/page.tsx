import type { Metadata } from "next"

import { EncryptionWorkflow } from "@/components/cipherpix/encryption-workflow"
import { PageHero } from "@/components/cipherpix/ui"

export const metadata: Metadata = { title: "Encrypt an Image" }

export default function EncryptPage() { return <><PageHero eyebrow="Local academic tool" title="Encrypt an Image" description="Transform the original file bytes with Caesar substitution and Rail Fence transposition, then download a versioned .cpx package." /><section className="page-container pb-12"><EncryptionWorkflow /></section></> }
