/// <reference lib="webworker" />

import { checksumMatches, hybridDecrypt, hybridEncrypt, sha256 } from "@/lib/cipherpix/crypto"
import { createCipherPixPackage, parseCipherPixPackage } from "@/lib/cipherpix/package"
import { CPX_MAGIC, CPX_VERSION, type CipherPixMetadata, type ProcessingStage } from "@/lib/cipherpix/types"

type EncryptRequest = {
  id: string
  type: "encrypt"
  bytes: ArrayBuffer
  key: number
  rails: number
  file: {
    name: string
    mimeType: string
    extension: string
    width: number
    height: number
  }
}

type DecryptRequest = {
  id: string
  type: "decrypt"
  packageBytes: ArrayBuffer
  key: number
  rails: number
}

type WorkerRequest = EncryptRequest | DecryptRequest

const worker = self as unknown as DedicatedWorkerGlobalScope

function stage(id: string, value: ProcessingStage): void {
  worker.postMessage({ id, type: "stage", stage: value })
}

worker.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data
  const started = performance.now()
  try {
    if (request.type === "encrypt") {
      stage(request.id, "hashing")
      const original = new Uint8Array(request.bytes)
      const checksum = await sha256(original)
      stage(request.id, "caesar")
      stage(request.id, "rail-fence")
      const encrypted = hybridEncrypt(original, request.key, request.rails)
      stage(request.id, "packaging")
      const metadata: CipherPixMetadata = {
        magic: CPX_MAGIC,
        version: CPX_VERSION,
        algorithm: "CAESAR_RAIL_FENCE",
        originalFileName: request.file.name,
        originalMimeType: request.file.mimeType,
        originalExtension: request.file.extension,
        originalSize: original.length,
        width: request.file.width,
        height: request.file.height,
        checksumAlgorithm: "SHA-256",
        originalChecksum: checksum,
        encryptedAt: new Date().toISOString(),
        encryptedDataLength: encrypted.length,
      }
      const packageBytes = createCipherPixPackage(metadata, encrypted)
      stage(request.id, "verifying")
      const reconstructed = hybridDecrypt(encrypted, request.key, request.rails)
      if (!(await checksumMatches(reconstructed, checksum))) throw new Error("Integrity verification failed before download.")
      worker.postMessage(
        { id: request.id, type: "encrypted", packageBytes: packageBytes.buffer, checksum, durationMs: performance.now() - started },
        [packageBytes.buffer],
      )
      return
    }

    stage(request.id, "reading")
    const parsed = parseCipherPixPackage(new Uint8Array(request.packageBytes))
    stage(request.id, "rail-fence")
    stage(request.id, "caesar")
    const recovered = hybridDecrypt(parsed.encryptedData, request.key, request.rails)
    stage(request.id, "verifying")
    if (!(await checksumMatches(recovered, parsed.metadata.originalChecksum))) {
      throw new Error("The recovered data does not match the original image checksum.")
    }
    worker.postMessage(
      { id: request.id, type: "decrypted", recoveredBytes: recovered.buffer, metadata: parsed.metadata, durationMs: performance.now() - started },
      [recovered.buffer],
    )
  } catch (error) {
    worker.postMessage({ id: request.id, type: "error", message: error instanceof Error ? error.message : "The browser could not process this operation." })
  }
}

export {}
