import { describe, expect, it } from "vitest"

import {
  caesarDecrypt,
  caesarEncrypt,
  checksumMatches,
  hybridDecrypt,
  hybridEncrypt,
  railFenceDecrypt,
  railFenceEncrypt,
  sha256,
} from "@/lib/cipherpix/crypto"

describe("Caesar transformation", () => {
  it.each([1, 255])("round-trips key %i without mutating input", (key) => {
    const input = Uint8Array.of(0, 1, 127, 254, 255)
    const original = input.slice()
    expect(caesarDecrypt(caesarEncrypt(input, key), key)).toEqual(input)
    expect(input).toEqual(original)
  })

  it("wraps modulo 256", () => {
    expect(caesarEncrypt(Uint8Array.of(255), 1)).toEqual(Uint8Array.of(0))
  })

  it.each([0, 256, 1.5])("rejects invalid key %s", (key) => {
    expect(() => caesarEncrypt(new Uint8Array(), key)).toThrow(RangeError)
  })
})

describe("Rail Fence transformation", () => {
  it.each([2, 3, 10])("round-trips edge-case lengths with %i rails", (rails) => {
    for (const length of [0, 1, 2, 9, 10, 101]) {
      const input = Uint8Array.from({ length }, (_, index) => (index * 37) & 0xff)
      expect(railFenceDecrypt(railFenceEncrypt(input, rails), rails)).toEqual(input)
    }
  })

  it("handles more rails than bytes", () => {
    const input = Uint8Array.of(9, 4)
    expect(railFenceDecrypt(railFenceEncrypt(input, 10), 10)).toEqual(input)
  })
})

describe("hybrid transform and integrity", () => {
  it("round-trips a deterministic large array", () => {
    const input = Uint8Array.from({ length: 250_000 }, (_, index) => (index * 19 + 7) & 0xff)
    expect(hybridDecrypt(hybridEncrypt(input, 255, 10), 255, 10)).toEqual(input)
  })

  it("compares real SHA-256 values", async () => {
    const input = new TextEncoder().encode("CipherPix")
    const digest = await sha256(input)
    expect(digest).toHaveLength(64)
    await expect(checksumMatches(input, digest)).resolves.toBe(true)
    await expect(checksumMatches(new TextEncoder().encode("changed"), digest)).resolves.toBe(false)
  })
})
