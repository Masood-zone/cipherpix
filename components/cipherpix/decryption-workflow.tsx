"use client"

import { FileCheck2, FileKey2, LockOpen } from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FileDropzone } from "@/components/cipherpix/file-dropzone"
import { Notice } from "@/components/cipherpix/ui"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/cipherpix/files"
import { parseCipherPixPackage } from "@/lib/cipherpix/package"
import { parseRecoveryNote } from "@/lib/cipherpix/recovery"
import { decryptInWorker } from "@/lib/cipherpix/worker-client"
import type { CipherPixMetadata } from "@/lib/cipherpix/types"
import { useHistoryStore } from "@/stores/history-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useDecryptionStore } from "@/stores/workflow-store"

const schema = z.object({
  key: z.coerce.number().int().min(1).max(255),
  rails: z.coerce.number().int().min(2).max(10),
})
type FormValues = z.infer<typeof schema>
interface SelectedPackage {
  file: File
  bytes: Uint8Array
  metadata: CipherPixMetadata
}

export function DecryptionWorkflow() {
  const router = useRouter()
  const addHistory = useHistoryStore((state) => state.add)
  const settings = useSettingsStore()
  const workflow = useDecryptionStore()
  const [selected, setSelected] = React.useState<SelectedPackage | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [noteWarning, setNoteWarning] = React.useState<string | null>(null)
  const noteInput = React.useRef<HTMLInputElement>(null)
  const form = useForm<FormValues>({ defaultValues: { key: 47, rails: 3 } })

  async function selectPackage(file: File): Promise<void> {
    setError(null)
    setNoteWarning(null)
    try {
      if (!file.name.toLowerCase().endsWith(".cpx"))
        throw new Error("This file is not a valid CipherPix package.")
      const bytes = new Uint8Array(await file.arrayBuffer())
      const parsed = parseCipherPixPackage(bytes)
      setSelected({ file, bytes, metadata: parsed.metadata })
      workflow.setPackageMetadata(parsed.metadata)
    } catch (cause) {
      setSelected(null)
      workflow.setPackageMetadata(null)
      setError(
        cause instanceof Error
          ? cause.message
          : "This file is not a valid CipherPix package."
      )
    }
  }

  async function importNote(file: File): Promise<void> {
    try {
      const note = parseRecoveryNote(await file.text())
      form.setValue("key", note.caesarKey, { shouldValidate: true })
      form.setValue("rails", note.railFenceRails, { shouldValidate: true })
      workflow.setRecoveryNote(note)
      setNoteWarning(
        note.encryptedFileName &&
          selected &&
          note.encryptedFileName !== selected.file.name
          ? "This note names a different .cpx file. It may have been renamed; integrity verification will decide whether it matches."
          : null
      )
      toast.success("Recovery note imported")
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Invalid recovery note."
      setError(message)
      toast.error(message)
    }
  }

  async function decrypt(values: FormValues): Promise<void> {
    if (!selected || busy) return
    setBusy(true)
    setError(null)
    workflow.setStage("reading")
    try {
      const response = await decryptInWorker(
        selected.bytes,
        values.key,
        values.rails,
        workflow.setStage
      )
      const blob = new Blob([response.recoveredBytes], {
        type: response.metadata.originalMimeType,
      })
      const previewUrl = URL.createObjectURL(blob)
      workflow.setResult({
        blob,
        previewUrl,
        metadata: response.metadata,
        durationMs: response.durationMs,
        integrityVerified: true,
      })
      if (settings.storeHistory)
        addHistory({
          id: crypto.randomUUID(),
          fileName: response.metadata.originalFileName,
          operation: "decrypt",
          fileSize: blob.size,
          durationMs: response.durationMs,
          integrityStatus: "verified",
          status: "completed",
          createdAt: new Date().toISOString(),
        })
      router.push("/decrypt/result")
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "These settings could not recover the original image."
      setError(message)
      toast.error(message)
      if (settings.storeHistory)
        addHistory({
          id: crypto.randomUUID(),
          fileName: selected.metadata.originalFileName,
          operation: "decrypt",
          fileSize: selected.metadata.originalSize,
          durationMs: 0,
          integrityStatus: "failed",
          status: "failed",
          createdAt: new Date().toISOString(),
        })
    } finally {
      setBusy(false)
    }
  }

  if (!selected)
    return (
      <div className="space-y-5">
        <FileDropzone
          accept=".cpx,application/x-cipherpix"
          title="Choose a CipherPix file"
          description="Drag and drop a .cpx encrypted package here."
          onFile={(file) => void selectPackage(file)}
        />
        <Notice title="Three local steps">
          Upload the package, provide the two recovery values, then CipherPix
          reverses and verifies the original bytes. Nothing leaves this browser.
        </Notice>
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-4 font-semibold text-destructive dark:bg-red-950/30"
          >
            {error}
          </p>
        )}
      </div>
    )

  return (
    <form
      className="grid gap-6 lg:grid-cols-[1.35fr_1fr]"
      onSubmit={form.handleSubmit((values) => {
        const parsed = schema.safeParse(values)
        if (!parsed.success) {
          for (const issue of parsed.error.issues) {
            const field = issue.path[0]
            if (field === "key" || field === "rails") form.setError(field, { message: issue.message })
          }
          return
        }
        void decrypt(parsed.data)
      })}
    >
      <div className="surface-card">
        <div className="flex items-start gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-secondary text-secondary-foreground">
            <FileCheck2 />
          </span>
          <div>
            <h2 className="text-xl font-bold">{selected.file.name}</h2>
            <p className="text-sm text-muted-foreground">
              Valid CipherPix package · {formatBytes(selected.file.size)}
            </p>
          </div>
        </div>
        <dl className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
          <Meta
            label="Package version"
            value={`Version ${selected.metadata.version}`}
          />
          <Meta
            label="Original filename"
            value={selected.metadata.originalFileName}
          />
          <Meta
            label="Original MIME type"
            value={selected.metadata.originalMimeType}
          />
          <Meta
            label="Encrypted"
            value={new Date(selected.metadata.encryptedAt).toLocaleString()}
          />
        </dl>
        <button
          type="button"
          className="mt-6 text-sm font-semibold text-primary"
          onClick={() => {
            setSelected(null)
            workflow.setPackageMetadata(null)
          }}
        >
          Choose a different package
        </button>
      </div>
      <div className="surface-card">
        <div className="flex items-center gap-2">
          <FileKey2 className="text-primary" />
          <h2 className="text-xl font-bold">Recovery settings</h2>
        </div>
        <div className="mt-5">
          <label className="label" htmlFor="decrypt-key">
            Caesar key
          </label>
          <input
            id="decrypt-key"
            className="field"
            type="number"
            {...form.register("key", { valueAsNumber: true })}
          />
          {form.formState.errors.key && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.key.message}
            </p>
          )}
        </div>
        <div className="mt-4">
          <label className="label" htmlFor="decrypt-rails">
            Rail Fence rails
          </label>
          <select
            id="decrypt-rails"
            className="field"
            {...form.register("rails", { valueAsNumber: true })}
          >
            {Array.from({ length: 9 }, (_, index) => index + 2).map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => noteInput.current?.click()}
        >
          <FileKey2 /> Import recovery note
        </Button>
        <input
          ref={noteInput}
          className="sr-only"
          type="file"
          accept=".json,.cpx-key.json,application/json"
          onChange={(event) => {
            if (event.target.files?.[0]) void importNote(event.target.files[0])
          }}
          aria-label="Import recovery note"
        />
        {noteWarning && (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">
            {noteWarning}
          </p>
        )}
        <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy}>
          <LockOpen /> {busy ? "Recovering locally…" : "Recover image"}
        </Button>
      </div>
      <div className="lg:col-span-2">
        {workflow.stage && (
          <p
            aria-live="polite"
            className="surface-card font-semibold text-primary"
          >
            Current stage: {workflow.stage.replace("-", " ")}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 p-4 font-semibold text-destructive dark:bg-red-950/30"
          >
            {error}
            <span className="mt-1 block text-sm font-normal">
              Check both the Caesar key and Rail Fence value. No recovered file
              or preview was created.
            </span>
          </p>
        )}
      </div>
    </form>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold break-all">{value}</dd>
    </div>
  )
}
