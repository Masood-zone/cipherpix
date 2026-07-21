import { describe, expect, it } from "vitest"

import { createCipherPixPackage, isCipherPixFile, parseCipherPixPackage, validateCipherPixPackage } from "@/lib/cipherpix/package"
import { CPX_MAGIC, CPX_VERSION, type CipherPixMetadata } from "@/lib/cipherpix/types"

function metadata(length = 4): CipherPixMetadata {
  return { magic: CPX_MAGIC, version: CPX_VERSION, algorithm: "CAESAR_RAIL_FENCE", originalFileName: "測試 image.png", originalMimeType: "image/png", originalExtension: "png", originalSize: length, width: 1, height: 1, checksumAlgorithm: "SHA-256", originalChecksum: "a".repeat(64), encryptedAt: "2026-07-20T12:00:00.000Z", encryptedDataLength: length }
}

describe("CipherPix package", () => {
  it("creates and parses a compact binary package", () => {
    const payload = Uint8Array.of(1, 2, 3, 4)
    const packaged = createCipherPixPackage(metadata(), payload)
    expect(isCipherPixFile(packaged)).toBe(true)
    expect(parseCipherPixPackage(packaged)).toEqual({ metadata: metadata(), encryptedData: payload })
  })

  it("detects wrong magic and unsupported versions", () => {
    const valid = createCipherPixPackage(metadata(), Uint8Array.of(1, 2, 3, 4))
    const wrongMagic = valid.slice(); wrongMagic[0] = 0
    expect(() => parseCipherPixPackage(wrongMagic)).toThrow("not a valid")
    const wrongVersion = valid.slice(); wrongVersion[4] = 2
    expect(() => parseCipherPixPackage(wrongVersion)).toThrow("unsupported")
  })

  it("detects corrupted metadata lengths and truncation", () => {
    const valid = createCipherPixPackage(metadata(), Uint8Array.of(1, 2, 3, 4))
    const badLength = valid.slice(); new DataView(badLength.buffer).setUint32(5, 0xffffffff, false)
    expect(validateCipherPixPackage(badLength)).toMatchObject({ valid: false })
    expect(() => parseCipherPixPackage(valid.slice(0, 10))).toThrow()
  })

  it("detects payload size mismatches", () => {
    const valid = createCipherPixPackage(metadata(), Uint8Array.of(1, 2, 3, 4))
    expect(() => parseCipherPixPackage(valid.slice(0, -1))).toThrow("size")
  })
})
