"use client"

import { ArrowRight, RotateCcw } from "lucide-react"
import * as React from "react"

import { PageHero } from "@/components/cipherpix/ui"
import {
  caesarDecrypt,
  caesarEncrypt,
  railFenceDecrypt,
  railFenceEncrypt,
} from "@/lib/cipherpix/crypto"

export default function AlgorithmsPage() {
  const [value, setValue] = React.useState(120)
  const [key, setKey] = React.useState(47)
  const [rails, setRails] = React.useState(3)
  const source = React.useMemo(() => new TextEncoder().encode("CIPHERPIX"), [])
  const shifted = caesarEncrypt(source, key)
  const transposed = railFenceEncrypt(shifted, rails)
  const restored = caesarDecrypt(railFenceDecrypt(transposed, rails), key)
  const single = caesarEncrypt(Uint8Array.of(value), key)[0]

  return (
    <>
      <PageHero
        eyebrow="Interactive academic module"
        title="Algorithm Explorer"
        description="Adjust the values and observe how substitution changes byte values while transposition changes their positions."
      />
      <section className="page-container space-y-6 pb-12">
        <div className="surface-card grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold">Caesar byte substitution</h2>
            <p className="mt-2 text-muted-foreground">
              Encrypted byte = (original byte + key) mod 256
            </p>
            <label className="label mt-5" htmlFor="original-byte">
              Original byte: {value}
            </label>
            <input
              id="original-byte"
              type="range"
              min="0"
              max="255"
              value={value}
              onChange={(event) => setValue(Number(event.target.value))}
              className="w-full"
            />
            <label className="label mt-5" htmlFor="demo-key">
              Key: {key}
            </label>
            <input
              id="demo-key"
              type="range"
              min="1"
              max="255"
              value={key}
              onChange={(event) => setKey(Number(event.target.value))}
              className="w-full"
            />
          </div>
          <div className="grid place-items-center rounded-xl bg-muted p-8">
            <div className="flex items-center gap-5 text-center">
              <div>
                <span className="block font-mono text-4xl font-bold">
                  {value}
                </span>
                <span className="text-sm text-muted-foreground">original</span>
              </div>
              <ArrowRight />
              <div>
                <span className="block font-mono text-4xl font-bold text-primary">
                  {single}
                </span>
                <span className="text-sm text-muted-foreground">encrypted</span>
              </div>
              <RotateCcw />
              <div>
                <span className="block font-mono text-4xl font-bold">
                  {caesarDecrypt(Uint8Array.of(single), key)[0]}
                </span>
                <span className="text-sm text-muted-foreground">reversed</span>
              </div>
            </div>
          </div>
        </div>
        <div className="surface-card">
          <h2 className="text-2xl font-bold">Rail Fence transposition</h2>
          <label className="label mt-4" htmlFor="demo-rails">
            Rails: {rails}
          </label>
          <input
            id="demo-rails"
            type="range"
            min="2"
            max="10"
            value={rails}
            onChange={(event) => setRails(Number(event.target.value))}
            className="max-w-md"
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Sequence label="Original sequence" bytes={source} />
            <Sequence
              label="Row-by-row order"
              bytes={railFenceEncrypt(source, rails)}
            />
            <Sequence
              label="Reverse reconstruction"
              bytes={railFenceDecrypt(railFenceEncrypt(source, rails), rails)}
            />
          </div>
        </div>
        <div className="surface-card bg-[#111827] text-white">
          <h2 className="text-2xl font-bold">Hybrid demonstration</h2>
          <p className="mt-2 text-slate-300">
            The same operations used by CipherPix, shown with a short
            educational sequence.
          </p>
          <div className="mt-6 grid gap-3 md:grid-cols-4">
            <Sequence label="Original" bytes={source} dark />
            <Sequence label="Caesar changed" bytes={shifted} dark />
            <Sequence label="Rail rearranged" bytes={transposed} dark />
            <Sequence label="Fully reversed" bytes={restored} dark />
          </div>
        </div>
      </section>
    </>
  )
}

function Sequence({
  label,
  bytes,
  dark = false,
}: {
  label: string
  bytes: Uint8Array
  dark?: boolean
}) {
  return (
    <div
      className={
        dark
          ? "rounded-xl border border-slate-700 bg-slate-900 p-4"
          : "rounded-xl border bg-muted p-4"
      }
    >
      <p className="mb-2 text-xs font-semibold tracking-wide uppercase opacity-70">
        {label}
      </p>
      <p className="font-mono text-sm break-all">
        {Array.from(bytes).join(" · ")}
      </p>
    </div>
  )
}
