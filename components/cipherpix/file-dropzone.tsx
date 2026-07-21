"use client"

import { FileUp } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export function FileDropzone({ accept, title, description, onFile, disabled = false }: { accept: string; title: string; description: string; onFile: (file: File) => void; disabled?: boolean }) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = React.useState(false)

  function receive(files: FileList | null): void {
    if (!disabled && files?.[0]) onFile(files[0])
  }

  return <div
    className={cn("grid min-h-72 place-items-center rounded-2xl border-2 border-dashed bg-card p-7 text-center transition", dragging && "border-primary bg-secondary", disabled && "opacity-60")}
    onDragEnter={(event) => { event.preventDefault(); setDragging(true) }}
    onDragOver={(event) => event.preventDefault()}
    onDragLeave={() => setDragging(false)}
    onDrop={(event) => { event.preventDefault(); setDragging(false); receive(event.dataTransfer.files) }}
  >
    <div><span className="mx-auto grid size-16 place-items-center rounded-full bg-secondary text-secondary-foreground"><FileUp className="size-7" /></span><h2 className="mt-5 text-2xl font-bold">{title}</h2><p className="mt-2 text-muted-foreground">{description}</p><button type="button" className="link-button mt-5" onClick={() => inputRef.current?.click()} disabled={disabled}>Choose File</button><input ref={inputRef} className="sr-only" type="file" accept={accept} onChange={(event) => receive(event.target.files)} disabled={disabled} aria-label={title} /></div>
  </div>
}
