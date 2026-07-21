/* eslint-disable @next/next/no-img-element */
"use client"

import { CheckCircle2, Download, FileCheck2, FilePlus2 } from "lucide-react"
import Link from "next/link"

import { LostResult, Notice } from "@/components/cipherpix/ui"
import { downloadBlob } from "@/lib/cipherpix/downloads"
import { formatBytes } from "@/lib/cipherpix/files"
import { useDecryptionStore } from "@/stores/workflow-store"

export default function DecryptionResultPage() {
  const { result, reset } = useDecryptionStore()
  if (!result) return <LostResult operation="decryption" />
  const hasImagePreview = Boolean(
    result.metadata.originalMimeType.startsWith("image/") &&
    result.metadata.width &&
    result.metadata.height
  )
  return (
    <section className="page-container section-space">
      <span className="eyebrow">
        <CheckCircle2 className="size-4" /> Process complete
      </span>
      <h1 className="page-title">Your File Has Been Recovered</h1>
      <p className="page-lead">
        The reconstructed bytes match the original SHA-256 checksum and are
        ready for download.
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="surface-card p-3">
          <div className="relative grid min-h-72 place-items-center overflow-hidden rounded-xl bg-muted">
            {hasImagePreview ? (
              <img
                src={result.previewUrl}
                alt={`Recovered ${result.metadata.originalFileName}`}
                className="max-h-[650px] min-h-72 w-full object-contain"
              />
            ) : (
              <div className="px-6 text-center text-muted-foreground">
                <FileCheck2 className="mx-auto size-24" aria-hidden="true" />
                <p className="mt-4 font-semibold break-all">
                  {result.metadata.originalFileName}
                </p>
                <p className="mt-1 text-sm">Ready to download</p>
              </div>
            )}
            <span className="absolute top-3 left-3 rounded-full bg-white px-3 py-2 text-sm font-semibold text-green-800 shadow">
              <CheckCircle2 className="mr-1 inline size-4" /> Integrity Verified
            </span>
          </div>
        </div>
        <div className="space-y-5">
          <div className="surface-card">
            <h2 className="text-2xl font-bold">Export actions</h2>
            <button
              className="link-button mt-5 w-full"
              onClick={() =>
                downloadBlob(result.blob, result.metadata.originalFileName)
              }
            >
              <Download className="size-4" /> Download Recovered File
            </button>
            <Link
              className="link-button-outline mt-3 w-full"
              href="/decrypt"
              onClick={reset}
            >
              <FilePlus2 className="size-4" /> Decrypt another file
            </Link>
            <Link
              className="link-button-outline mt-3 w-full"
              href="/encrypt"
              onClick={reset}
            >
              Encrypt this file again
            </Link>
          </div>
          <div className="surface-card">
            <h2 className="text-lg font-bold">Recovery details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Meta label="Filename" value={result.metadata.originalFileName} />
              <Meta
                label="MIME type"
                value={result.metadata.originalMimeType}
              />
              <Meta label="File size" value={formatBytes(result.blob.size)} />
              <Meta
                label="Dimensions"
                value={
                  result.metadata.width && result.metadata.height
                    ? `${result.metadata.width} × ${result.metadata.height}px`
                    : "Not recorded"
                }
              />
              <Meta
                label="Duration"
                value={`${result.durationMs.toFixed(1)} ms`}
              />
            </dl>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <Notice tone="success" title="Integrity Verified">
          “Verified” is shown only because CipherPix calculated SHA-256 over the
          reconstructed bytes and matched the checksum stored in the package.
        </Notice>
      </div>
    </section>
  )
}
function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2 last:border-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold break-all">{value}</dd>
    </div>
  )
}
