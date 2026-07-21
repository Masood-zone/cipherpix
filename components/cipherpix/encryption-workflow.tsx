/* eslint-disable @next/next/no-img-element */
"use client"

import {
  Copy,
  Eye,
  EyeOff,
  FileCheck2,
  ImageIcon,
  RefreshCw,
  Trash2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { FileDropzone } from "@/components/cipherpix/file-dropzone"
import { Notice } from "@/components/cipherpix/ui"
import { Button } from "@/components/ui/button"
import {
  createRecoveryNote,
  serializeRecoveryNote,
} from "@/lib/cipherpix/recovery"
import {
  baseName,
  formatBytes,
  inspectImageFile,
  sanitizeFileName,
} from "@/lib/cipherpix/files"
import { CPX_MIME_TYPE } from "@/lib/cipherpix/types"
import { encryptInWorker } from "@/lib/cipherpix/worker-client"
import { useHistoryStore } from "@/stores/history-store"
import { useSettingsStore } from "@/stores/settings-store"
import { useEncryptionStore } from "@/stores/workflow-store"
import { generateCaesarKey } from "@/lib/cipherpix/crypto"

const schema = z.object({
  key: z.coerce.number().int().min(1).max(255),
  rails: z.coerce.number().int().min(2).max(10),
  outputName: z.string().max(120),
  includeMetadata: z.boolean(),
})
type FormValues = z.infer<typeof schema>

interface SelectedImage {
  file: File
  bytes: Uint8Array
  width: number
  height: number
  previewUrl: string
}

const stages = [
  ["reading", "Reading image data"],
  ["hashing", "Calculating integrity checksum"],
  ["caesar", "Applying Caesar transformation"],
  ["rail-fence", "Applying Rail Fence rearrangement"],
  ["packaging", "Building CipherPix package"],
  ["verifying", "Verifying recovery"],
  ["ready", "Preparing download"],
] as const

export function EncryptionWorkflow() {
  const router = useRouter()
  const settings = useSettingsStore()
  const addHistory = useHistoryStore((state) => state.add)
  const { stage, setStage, setResult, reset } = useEncryptionStore()
  const [selected, setSelected] = React.useState<SelectedImage | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [showKey, setShowKey] = React.useState(false)
  const [confirming, setConfirming] = React.useState(false)
  const [pendingValues, setPendingValues] = React.useState<FormValues | null>(null)
  const form = useForm<FormValues>({
    defaultValues: {
      key: 47,
      rails: settings.defaultRails,
      outputName: "",
      includeMetadata: settings.recoveryMetadata,
    },
  })
  const key = useWatch({ control: form.control, name: "key" })
  const rails = useWatch({ control: form.control, name: "rails" })

  React.useEffect(() => {
    form.setValue("key", generateCaesarKey())
  }, [form])
  React.useEffect(
    () => () => {
      if (selected) URL.revokeObjectURL(selected.previewUrl)
    },
    [selected]
  )

  async function selectFile(file: File): Promise<void> {
    setError(null)
    try {
      const inspected = await inspectImageFile(
        file,
        settings.maxImageSizeMb * 1024 * 1024
      )
      if (selected) URL.revokeObjectURL(selected.previewUrl)
      const previewUrl = URL.createObjectURL(file)
      setSelected({
        file,
        bytes: inspected.bytes,
        width: inspected.width,
        height: inspected.height,
        previewUrl,
      })
      form.setValue("outputName", baseName(file.name))
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "This browser could not process the selected file."
      )
    }
  }

  function recoveryText(values = form.getValues()): string {
    const outputName = `${sanitizeFileName(values.outputName || (selected ? baseName(selected.file.name) : "cipherpix-image"))}.cpx`
    return serializeRecoveryNote(
      createRecoveryNote(
        values.key,
        values.rails,
        outputName,
        values.includeMetadata
      )
    )
  }

  async function copySettings(): Promise<void> {
    await navigator.clipboard.writeText(
      `CipherPix recovery settings\nCaesar key: ${key}\nRail Fence rails: ${rails}`
    )
    toast.success("Recovery settings copied")
  }

  function downloadNoteNow(): void {
    const blob = new Blob([recoveryText()], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `${sanitizeFileName(form.getValues("outputName") || "cipherpix-image")}.cpx-key.json`
    anchor.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success("Recovery note downloaded")
  }

  async function begin(values: FormValues): Promise<void> {
    if (!selected || busy) return
    setConfirming(false)
    setBusy(true)
    setError(null)
    reset()
    setStage("reading")
    const outputBase = sanitizeFileName(
      values.outputName || baseName(selected.file.name)
    )
    const encryptedFileName = `${outputBase}.cpx`
    try {
      const response = await encryptInWorker(
        selected.bytes,
        values.key,
        values.rails,
        {
          name: selected.file.name,
          mimeType: selected.file.type,
          extension: selected.file.name.split(".").pop()?.toLowerCase() ?? "",
          width: selected.width,
          height: selected.height,
        },
        setStage
      )
      const note = createRecoveryNote(
        values.key,
        values.rails,
        encryptedFileName,
        values.includeMetadata
      )
      const packageBlob = new Blob([response.packageBytes], {
        type: CPX_MIME_TYPE,
      })
      const recoveryBlob = new Blob([serializeRecoveryNote(note)], {
        type: "application/json",
      })
      setResult({
        packageBlob,
        recoveryBlob,
        encryptedFileName,
        recoveryFileName: `${outputBase}.cpx-key.json`,
        originalFileName: selected.file.name,
        originalSize: selected.file.size,
        encryptedSize: packageBlob.size,
        key: values.key,
        rails: values.rails,
        durationMs: response.durationMs,
        checksum: response.checksum,
        integrityVerified: true,
      })
      if (settings.storeHistory)
        addHistory({
          id: crypto.randomUUID(),
          fileName: selected.file.name,
          operation: "encrypt",
          fileSize: selected.file.size,
          durationMs: response.durationMs,
          integrityStatus: "verified",
          status: "completed",
          createdAt: new Date().toISOString(),
        })
      router.push("/encrypt/result")
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "This browser could not process the selected file."
      setError(message)
      toast.error(message)
      if (settings.storeHistory)
        addHistory({
          id: crypto.randomUUID(),
          fileName: selected.file.name,
          operation: "encrypt",
          fileSize: selected.file.size,
          durationMs: 0,
          integrityStatus: "failed",
          status: "failed",
          createdAt: new Date().toISOString(),
        })
    } finally {
      setBusy(false)
    }
  }

  const submit = form.handleSubmit((values) => {
    const parsed = schema.safeParse(values)
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (
          field === "key" ||
          field === "rails" ||
          field === "outputName" ||
          field === "includeMetadata"
        )
          form.setError(field, { message: issue.message })
      }
      return
    }
    if (settings.showSaveConfirmation) {
      setPendingValues(parsed.data)
      setConfirming(true)
    } else void begin(parsed.data)
  })

  if (!selected)
    return (
      <div className="space-y-5">
        <FileDropzone
          accept=".png,.jpg,.jpeg,.webp,.bmp,image/png,image/jpeg,image/webp,image/bmp"
          title="Choose an image to encrypt"
          description={`Drag and drop a PNG, JPG, JPEG, WEBP or BMP up to ${settings.maxImageSizeMb} MB.`}
          onFile={(file) => void selectFile(file)}
        />
        <Notice title="Your image stays private">
          CipherPix reads and transforms the file locally. No upload or server
          storage occurs.
        </Notice>
        {error && (
          <p role="alert" className="text-sm font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>
    )

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="surface-card grid gap-6 md:grid-cols-[260px_1fr]">
        <img
          src={selected.previewUrl}
          alt={`Preview of ${selected.file.name}`}
          className="h-56 w-full rounded-xl bg-muted object-contain"
        />
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xl font-bold">{selected.file.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selected.file.type} · {formatBytes(selected.file.size)} ·{" "}
                {selected.width} × {selected.height}px
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove image"
              onClick={() => {
                URL.revokeObjectURL(selected.previewUrl)
                setSelected(null)
              }}
            >
              <Trash2 />
            </Button>
          </div>
          <Notice title="Original file bytes">
            The preview confirms the file is a decodable image. Encryption
            operates on every original file byte.
          </Notice>
        </div>
      </div>
      <div className="surface-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="eyebrow">Beginner mode</span>
            <h2 className="mt-3 text-2xl font-bold">Recovery settings</h2>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              form.setValue("key", generateCaesarKey())
              form.setValue("rails", settings.defaultRails)
            }}
          >
            <RefreshCw /> Regenerate
          </Button>
        </div>
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <div>
            <label className="label" htmlFor="key">
              Caesar key
            </label>
            <div className="flex gap-2">
              <input
                id="key"
                className="field font-mono"
                type={showKey ? "number" : "password"}
                {...form.register("key", { valueAsNumber: true })}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowKey((value) => !value)}
                aria-label={showKey ? "Hide Caesar key" : "Show Caesar key"}
              >
                {showKey ? <EyeOff /> : <Eye />}
              </Button>
            </div>
            {form.formState.errors.key && (
              <p className="mt-1 text-sm text-destructive">
                {form.formState.errors.key.message}
              </p>
            )}
          </div>
          <div>
            <label className="label" htmlFor="rails">
              Rail Fence rails
            </label>
            <select id="rails" className="field" {...form.register("rails", { valueAsNumber: true })}>
              {Array.from({ length: 9 }, (_, index) => index + 2).map(
                (value) => (
                  <option key={value}>{value}</option>
                )
              )}
            </select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void copySettings()}
          >
            <Copy /> Copy settings
          </Button>
          <Button type="button" variant="outline" onClick={downloadNoteNow}>
            <FileCheck2 /> Download recovery note
          </Button>
        </div>
        <details className="mt-6 rounded-xl border p-4">
          <summary className="font-semibold">Advanced settings</summary>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div>
              <label className="label" htmlFor="output">
                Output filename
              </label>
              <input
                id="output"
                className="field"
                {...form.register("outputName")}
              />
            </div>
            <label className="flex items-start gap-3 rounded-xl border p-4">
              <input
                type="checkbox"
                className="mt-1"
                {...form.register("includeMetadata")}
              />
              <span>
                <strong className="block">Recovery-note metadata</strong>
                <span className="text-sm text-muted-foreground">
                  Include encrypted filename and date in the separate note.
                </span>
              </span>
            </label>
            <label className="flex items-start gap-3 rounded-xl border p-4 opacity-80">
              <input type="checkbox" checked disabled className="mt-1" />
              <span>
                <strong className="block">Verify before download</strong>
                <span className="text-sm text-muted-foreground">
                  Required by CipherPix and cannot be disabled.
                </span>
              </span>
            </label>
          </div>
        </details>
      </div>
      {busy && <Progress stage={stage} />}
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-4 font-semibold text-destructive dark:bg-red-950/30"
        >
          {error}
        </p>
      )}
      <Button
        type="submit"
        size="lg"
        className="w-full sm:w-auto"
        disabled={busy}
      >
        <ImageIcon /> {busy ? "Encrypting locally…" : "Encrypt image"}
      </Button>
      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="save-title"
            className="surface-card w-full max-w-lg"
          >
            <h2 id="save-title" className="text-2xl font-bold">
              Have you saved your recovery settings?
            </h2>
            <p className="mt-3 text-muted-foreground">
              The key and rail value are not stored in the `.cpx` file. Losing
              them means the image cannot be recovered.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                onClick={() => {
                  void copySettings()
                  if (pendingValues) void begin(pendingValues)
                }}
              >
                <Copy /> Copy and continue
              </Button>
              <Button type="button" variant="outline" onClick={downloadNoteNow}>
                Download Recovery Note
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => { if (pendingValues) void begin(pendingValues) }}
              >
                I Have Saved Them
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}

function Progress({ stage }: { stage: string | null }) {
  const current = stages.findIndex(([value]) => value === stage)
  return (
    <div className="surface-card" aria-live="polite">
      <h2 className="font-bold">Processing locally</h2>
      <ol className="mt-4 grid gap-2 sm:grid-cols-2">
        {stages.map(([value, label], index) => (
          <li
            key={value}
            className={`flex items-center gap-2 text-sm ${index <= current ? "font-semibold text-primary" : "text-muted-foreground"}`}
          >
            <span className="grid size-6 place-items-center rounded-full border">
              {index < current ? "✓" : index + 1}
            </span>
            {label}
          </li>
        ))}
      </ol>
    </div>
  )
}
