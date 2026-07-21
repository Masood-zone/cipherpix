import { describe, expect, it } from "vitest"

import { sanitizeFileName, validateImageBytes } from "@/lib/cipherpix/files"
import {
  createCipherPixPackage,
  isCipherPixFile,
  parseCipherPixPackage,
  validateCipherPixPackage,
} from "@/lib/cipherpix/package"
import {
  createRecoveryNote,
  parseRecoveryNote,
  serializeRecoveryNote,
} from "@/lib/cipherpix/recovery"
import {
  CPX_MAGIC,
  CPX_VERSION,
  type CipherPixMetadata,
} from "@/lib/cipherpix/types"

function metadata(length = 4): CipherPixMetadata {
  return {
    magic: CPX_MAGIC,
    version: CPX_VERSION,
    algorithm: "CAESAR_RAIL_FENCE",
    originalFileName: "測試 image.png",
    originalMimeType: "image/png",
    originalExtension: "png",
    originalSize: length,
    width: 1,
    height: 1,
    checksumAlgorithm: "SHA-256",
    originalChecksum: "a".repeat(64),
    encryptedAt: "2026-07-20T12:00:00.000Z",
    encryptedDataLength: length,
  }
}

describe("CipherPix packages", () => {
  it("creates and parses a binary package", () => {
    const payload = Uint8Array.of(1, 2, 3, 4)
    const packaged = createCipherPixPackage(metadata(), payload)
    expect(isCipherPixFile(packaged)).toBe(true)
    expect(parseCipherPixPackage(packaged)).toEqual({
      metadata: metadata(),
      encryptedData: payload,
    })
  })

  it("detects wrong magic, versions, lengths, and truncation", () => {
    const valid = createCipherPixPackage(metadata(), Uint8Array.of(1, 2, 3, 4))
    const wrongMagic = valid.slice()
    wrongMagic[0] = 0
    expect(() => parseCipherPixPackage(wrongMagic)).toThrow("not a valid")
    const wrongVersion = valid.slice()
    wrongVersion[4] = 2
    expect(() => parseCipherPixPackage(wrongVersion)).toThrow("unsupported")
    const badLength = valid.slice()
    new DataView(badLength.buffer).setUint32(5, 0xffffffff, false)
    expect(validateCipherPixPackage(badLength)).toMatchObject({ valid: false })
    expect(() => parseCipherPixPackage(valid.slice(0, -1))).toThrow("size")
  })
})

describe("file and recovery validation", () => {
  const png = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10, 0)

  it("checks MIME, extension, signature, size, and emptiness", () => {
    expect(validateImageBytes("campus.png", "image/png", png)).toBe("png")
    expect(() =>
      validateImageBytes("campus.png", "image/png", Uint8Array.of(1))
    ).toThrow("not supported")
    expect(() =>
      validateImageBytes("x.png", "image/png", new Uint8Array())
    ).toThrow("empty")
    expect(() => validateImageBytes("x.png", "image/png", png, 2)).toThrow(
      "file-size"
    )
  })

  it("sanitizes traversal while preserving Unicode", () => {
    expect(sanitizeFileName("../../校園:event?.png")).toBe("校園-event-.png")
    expect(sanitizeFileName("...", "fallback")).toBe("fallback")
  })

  it("round-trips valid notes and rejects invalid notes", () => {
    const note = createRecoveryNote(47, 3, "campus.cpx", true)
    expect(parseRecoveryNote(serializeRecoveryNote(note))).toMatchObject({
      caesarKey: 47,
      railFenceRails: 3,
    })
    expect(() => parseRecoveryNote("{}")).toThrow()
  })
})
