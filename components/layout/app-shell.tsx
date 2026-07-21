"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BookOpen,
  History,
  KeyRound,
  LockKeyhole,
  Menu,
  Moon,
  Settings,
  ShieldCheck,
  Sun,
  X,
} from "lucide-react"
import { useTheme } from "next-themes"
import * as React from "react"
import { Toaster } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navigation = [
  { href: "/", label: "How It Works" },
  { href: "/encrypt", label: "Encrypt" },
  { href: "/decrypt", label: "Decrypt" },
  { href: "/algorithms", label: "Algorithms" },
  { href: "/security", label: "Security" },
  { href: "/history", label: "History" },
  { href: "/guide", label: "Help" },
  { href: "/settings", label: "Settings" },
]

function Brand() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 font-heading text-xl font-bold"
      aria-label="CipherPix home"
    >
      <span className="grid size-9 place-items-center rounded-lg bg-[#111827] text-white dark:bg-white dark:text-[#111827]">
        <LockKeyhole className="size-5" />
      </span>
      CipherPix
    </Link>
  )
}

function ThemeButton() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Toggle color theme"
    >
      <Sun className="hidden size-5 dark:block" />
      <Moon className="size-5 dark:hidden" />
    </Button>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname()
  const [open, setOpen] = React.useState(false)
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="page-container flex h-16 items-center justify-between gap-5">
          <Brand />
          <nav
            className="hidden items-center gap-1 lg:flex"
            aria-label="Main navigation"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                  path === item.href && "bg-secondary text-secondary-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-1">
            <ThemeButton />
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onMouseDown={() => setOpen(false)}
        >
          <nav
            className="ml-auto flex h-full w-[min(85vw,22rem)] flex-col bg-card p-5 shadow-2xl"
            aria-label="Mobile navigation"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <Brand />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
                aria-label="Close navigation menu"
              >
                <X />
              </Button>
            </div>
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-lg px-4 py-3 font-medium",
                  path === item.href
                    ? "bg-secondary text-secondary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <main className="flex-1">{children}</main>
      <footer className="mt-12 border-t bg-card">
        <div className="page-container flex flex-col gap-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Brand />
            <p className="mt-2">Academic cryptography, processed locally.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/about">About</Link>
            <Link href="/guide">Documentation</Link>
            <Link href="/security">Security & limitations</Link>
            <a href="https://github.com/Masood-zone/cipherpix" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
      </footer>
      <Toaster richColors closeButton />
    </div>
  )
}

export const featureIcons = {
  BookOpen,
  History,
  KeyRound,
  Settings,
  ShieldCheck,
}
