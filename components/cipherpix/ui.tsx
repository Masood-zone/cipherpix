import Link from "next/link"
import { AlertTriangle, CheckCircle2, Info, LockKeyhole, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageHero({ eyebrow, title, description, centered = false, children }: { eyebrow: string; title: string; description: string; centered?: boolean; children?: ReactNode }) {
  return (
    <section className={cn("page-container pt-12 pb-8 sm:pt-16", centered && "text-center")}>
      <span className="eyebrow">{eyebrow}</span>
      <h1 className={cn("page-title", centered && "mx-auto")}>{title}</h1>
      <p className={cn("page-lead", centered && "mx-auto")}>{description}</p>
      {children && <div className={cn("mt-7 flex flex-wrap gap-3", centered && "justify-center")}>{children}</div>}
    </section>
  )
}

export function Notice({ tone = "info", title, children }: { tone?: "info" | "warning" | "success"; title: string; children: ReactNode }) {
  const Icon = tone === "warning" ? AlertTriangle : tone === "success" ? CheckCircle2 : Info
  return (
    <div role={tone === "warning" ? "alert" : "note"} className={cn("flex gap-3 rounded-xl border p-4", tone === "warning" ? "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100" : tone === "success" ? "border-green-300 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950/30 dark:text-green-100" : "border-blue-200 bg-blue-50 text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100")}>
      <Icon className="mt-0.5 size-5 shrink-0" /><div><p className="font-semibold">{title}</p><div className="mt-1 text-sm leading-6 opacity-85">{children}</div></div>
    </div>
  )
}

export function FeatureCard({ icon: Icon = LockKeyhole, title, children }: { icon?: LucideIcon; title: string; children: ReactNode }) {
  return <article className="surface-card"><span className="mb-4 grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Icon className="size-5" /></span><h2 className="text-xl font-bold">{title}</h2><div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div></article>
}

export function Journey({ steps }: { steps: string[] }) {
  return <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{steps.map((step, index) => <li key={step} className="surface-card flex items-start gap-3"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{index + 1}</span><span className="pt-1 font-semibold">{step}</span></li>)}</ol>
}

export function LostResult({ operation }: { operation: "encryption" | "decryption" }) {
  return <div className="page-container section-space"><div className="surface-card mx-auto max-w-xl text-center"><AlertTriangle className="mx-auto size-12 text-amber-600" /><h1 className="mt-4 text-2xl font-bold">Temporary result unavailable</h1><p className="mt-3 text-muted-foreground">The temporary result is no longer available. Repeat the operation. CipherPix does not persist image data between page refreshes.</p><Link className="link-button mt-6" href={operation === "encryption" ? "/encrypt" : "/decrypt"}>Start {operation} again</Link></div></div>
}
