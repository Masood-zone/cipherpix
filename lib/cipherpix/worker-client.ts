import type { CipherPixMetadata, ProcessingStage } from "./types"

type StageResponse = { id: string; type: "stage"; stage: ProcessingStage }
type ErrorResponse = { id: string; type: "error"; message: string }
type EncryptedResponse = {
  id: string
  type: "encrypted"
  packageBytes: ArrayBuffer
  checksum: string
  durationMs: number
}
type DecryptedResponse = {
  id: string
  type: "decrypted"
  recoveredBytes: ArrayBuffer
  metadata: CipherPixMetadata
  durationMs: number
}
type WorkerResponse =
  StageResponse | ErrorResponse | EncryptedResponse | DecryptedResponse

function runWorker<T extends EncryptedResponse | DecryptedResponse>(
  request: Record<string, unknown> & { id: string },
  transfer: Transferable[],
  onStage: (stage: ProcessingStage) => void
): Promise<T> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(
      new URL("../../workers/cipher.worker.ts", import.meta.url),
      { type: "module" }
    )
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const response = event.data
      if (response.id !== request.id) return
      if (response.type === "stage") onStage(response.stage)
      else {
        worker.terminate()
        if (response.type === "error") reject(new Error(response.message))
        else resolve(response as T)
      }
    }
    worker.onerror = () => {
      worker.terminate()
      reject(
        new Error("This browser could not start the local encryption worker.")
      )
    }
    worker.postMessage(request, transfer)
  })
}

export function encryptInWorker(
  bytes: Uint8Array,
  key: number,
  rails: number,
  file: {
    name: string
    mimeType: string
    extension: string
    width?: number
    height?: number
  },
  onStage: (stage: ProcessingStage) => void
): Promise<EncryptedResponse> {
  const transferable = Uint8Array.from(bytes).buffer
  return runWorker(
    {
      id: crypto.randomUUID(),
      type: "encrypt",
      bytes: transferable,
      key,
      rails,
      file,
    },
    [transferable],
    onStage
  )
}

export function decryptInWorker(
  packageBytes: Uint8Array,
  key: number,
  rails: number,
  onStage: (stage: ProcessingStage) => void
): Promise<DecryptedResponse> {
  const transferable = Uint8Array.from(packageBytes).buffer
  return runWorker(
    {
      id: crypto.randomUUID(),
      type: "decrypt",
      packageBytes: transferable,
      key,
      rails,
    },
    [transferable],
    onStage
  )
}
