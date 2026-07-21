"use client"

import { Clock3, Eye, Search, ShieldCheck, Trash2, X } from "lucide-react"
import * as React from "react"

import { PageHero } from "@/components/cipherpix/ui"
import { Button } from "@/components/ui/button"
import { formatBytes } from "@/lib/cipherpix/files"
import type { ActivityRecord } from "@/lib/cipherpix/types"
import { useHistoryStore } from "@/stores/history-store"

export default function HistoryPage() {
  const { records, clear } = useHistoryStore()
  const [query, setQuery] = React.useState("")
  const [operation, setOperation] = React.useState("all")
  const [status, setStatus] = React.useState("all")
  const [detail, setDetail] = React.useState<ActivityRecord | null>(null)
  const [confirmClear, setConfirmClear] = React.useState(false)
  const filtered = records.filter(
    (record) =>
      record.fileName.toLowerCase().includes(query.toLowerCase()) &&
      (operation === "all" || record.operation === operation) &&
      (status === "all" || record.status === status)
  )

  return (
    <>
      <PageHero
        eyebrow="Local-only log"
        title="Activity History"
        description="Review non-sensitive summaries stored only in this browser. Files, previews, keys, rails, recovery notes and checksums are never recorded."
      >
        <Button
          variant="outline"
          onClick={() => setConfirmClear(true)}
          disabled={!records.length}
        >
          <Trash2 /> Clear history
        </Button>
      </PageHero>
      <section className="page-container pb-12">
        <div className="grid gap-3 md:grid-cols-[1fr_220px_220px]">
          <label className="relative">
            <Search className="absolute top-3 left-3 size-5 text-muted-foreground" />
            <span className="sr-only">Search history</span>
            <input
              className="field pl-10"
              placeholder="Search filenames…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <select
            className="field"
            value={operation}
            onChange={(event) => setOperation(event.target.value)}
            aria-label="Filter by operation"
          >
            <option value="all">All operations</option>
            <option value="encrypt">Encryption</option>
            <option value="decrypt">Decryption</option>
          </select>
          <select
            className="field"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="Filter by status"
          >
            <option value="all">All statuses</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
        </div>
        <div className="surface-card mt-5 overflow-x-auto p-0">
          {filtered.length ? (
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-4">Filename</th>
                  <th className="p-4">Operation</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record.id} className="border-t">
                    <td className="p-4">
                      <p className="max-w-xs truncate font-semibold">
                        {record.fileName}
                      </p>
                      <p className="text-muted-foreground">
                        {formatBytes(record.fileSize)}
                      </p>
                    </td>
                    <td className="p-4 capitalize">{record.operation}</td>
                    <td className="p-4">
                      {new Date(record.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${record.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200"}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDetail(record)}
                        aria-label={`View details for ${record.fileName}`}
                      >
                        <Eye />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="grid min-h-64 place-items-center p-8 text-center">
              <div>
                <Clock3 className="mx-auto size-10 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-bold">
                  No activity recorded yet
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Completed or failed local operations will appear here when
                  history is enabled.
                </p>
              </div>
            </div>
          )}
          <div className="border-t bg-muted p-4 text-sm text-muted-foreground">
            <ShieldCheck className="mr-2 inline size-4" /> Local summaries only
            · Showing {filtered.length} entries
          </div>
        </div>
      </section>
      {detail && (
        <Modal onClose={() => setDetail(null)} title="Activity details">
          <dl className="space-y-3 text-sm">
            <Row label="Filename" value={detail.fileName} />
            <Row label="Operation" value={detail.operation} />
            <Row label="Size" value={formatBytes(detail.fileSize)} />
            <Row
              label="Duration"
              value={`${detail.durationMs.toFixed(1)} ms`}
            />
            <Row label="Integrity" value={detail.integrityStatus} />
            <Row label="Status" value={detail.status} />
            <Row
              label="Created"
              value={new Date(detail.createdAt).toLocaleString()}
            />
          </dl>
        </Modal>
      )}
      {confirmClear && (
        <Modal
          onClose={() => setConfirmClear(false)}
          title="Clear local history?"
        >
          <p className="text-muted-foreground">
            This permanently removes the non-sensitive summaries stored by
            CipherPix in this browser.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmClear(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                clear()
                setConfirmClear(false)
              }}
            >
              Clear history
            </Button>
          </div>
        </Modal>
      )}
    </>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="surface-card w-full max-w-lg"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 id="modal-title" className="text-2xl font-bold">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X />
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b pb-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-semibold break-all capitalize">{value}</dd>
    </div>
  )
}
