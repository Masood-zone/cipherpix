import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"

import { FileDropzone } from "@/components/cipherpix/file-dropzone"
import { LostResult } from "@/components/cipherpix/ui"

describe("workflow components", () => {
  it("explains why a refreshed temporary result is unavailable", () => {
    render(<LostResult operation="encryption" />)
    expect(screen.getByRole("heading", { name: /temporary result unavailable/i })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /start encryption again/i })).toHaveAttribute("href", "/encrypt")
  })

  it("passes a chosen file from the accessible input", () => {
    const onFile = vi.fn()
    render(<FileDropzone accept=".png" title="Choose image" description="PNG only" onFile={onFile} />)
    const file = new File([Uint8Array.of(1)], "x.png", { type: "image/png" })
    fireEvent.change(screen.getByLabelText("Choose image"), { target: { files: [file] } })
    expect(onFile).toHaveBeenCalledWith(file)
  })
})
