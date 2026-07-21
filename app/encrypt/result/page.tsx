"use client"

import {
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileKey2,
  LockKeyhole,
} from "lucide-react"
import Link from "next/link"
import * as React from "react"
import { toast } from "sonner"

import { LostResult, Notice } from "@/components/cipherpix/ui"
import { downloadBlob } from "@/lib/cipherpix/downloads"
import { formatBytes } from "@/lib/cipherpix/files"
import { useEncryptionStore } from "@/stores/workflow-store"

export default function EncryptionResultPage() {
  const { result, reset } = useEncryptionStore()
  const [showKey, setShowKey] = React.useState(false)
  if (!result) return <LostResult operation="encryption" />

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(
      `CipherPix recovery settings\nCaesar key: ${result!.key}\nRail Fence rails: ${result!.rails}`
    )
    toast.success("Recovery settings copied")
  }

  return (
    <section className="page-container section-space">
      <div className="mx-auto max-w-4xl text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
          <CheckCircle2 className="size-8" />
        </span>
        <h1 className="mt-5 text-4xl font-bold">
          Your File Has Been Encrypted
        </h1>
        <p className="mt-3 text-muted-foreground">
          The package was created and an actual reverse transformation matched
          the original SHA-256 checksum.
        </p>
      </div>
      <div className="mx-auto mt-9 grid max-w-4xl gap-5 md:grid-cols-[1.5fr_1fr]">
        <div className="surface-card">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <LockKeyhole />
            </span>
            <div>
              <h2 className="text-xl font-bold">{result.encryptedFileName}</h2>
              <p className="text-sm text-muted-foreground">
                CipherPix encrypted package
              </p>
            </div>
          </div>
          <dl className="mt-7 grid grid-cols-2 gap-4 border-t pt-5 text-sm">
            <div>
              <dt className="text-muted-foreground">Original</dt>
              <dd className="mt-1 font-semibold">{result.originalFileName}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Package size</dt>
              <dd className="mt-1 font-semibold">
                {formatBytes(result.encryptedSize)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Duration</dt>
              <dd className="mt-1 font-semibold">
                {result.durationMs.toFixed(1)} ms
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Integrity</dt>
              <dd className="mt-1 font-semibold text-green-700 dark:text-green-300">
                Verified
              </dd>
            </div>
          </dl>
          <button
            className="link-button mt-6 w-full"
            onClick={() =>
              downloadBlob(result.packageBlob, result.encryptedFileName)
            }
          >
            <Download className="size-4" /> Download encrypted file
          </button>
        </div>
        <div className="surface-card bg-[#111827] text-white">
          <FileKey2 className="text-cyan-300" />
          <h2 className="mt-4 text-xl font-bold">Recovery settings</h2>
          <p className="mt-2 text-sm text-slate-300">
            Keep these separate from the encrypted package.
          </p>
          <div className="mt-4 rounded-lg bg-white/10 p-3 font-mono text-sm">
            <div className="flex items-center justify-between">
              <span>Key: {showKey ? result.key : "•••"}</span>
              <button
                onClick={() => setShowKey((value) => !value)}
                aria-label={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <p className="mt-2">Rails: {result.rails}</p>
          </div>
          <button
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 font-semibold text-[#111827]"
            onClick={() =>
              downloadBlob(result.recoveryBlob, result.recoveryFileName)
            }
          >
            <Download className="size-4" /> Download note
          </button>
          <button
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/30 px-4 py-2 text-sm"
            onClick={() => void copy()}
          >
            <Copy className="size-4" /> Copy settings
          </button>
        </div>
      </div>
      <div className="mx-auto mt-5 max-w-4xl">
        <Notice title="What is a .cpx file?">
          The `.cpx` file is an encrypted package rather than the original file
          format. It contains versioned metadata and transformed binary data,
          but not the Caesar key or rail value.
        </Notice>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/encrypt" className="link-button-outline" onClick={reset}>
            Encrypt another file
          </Link>
          <Link href="/decrypt" className="link-button">
            Go to Decrypt
          </Link>
        </div>
      </div>
    </section>
  )
}
