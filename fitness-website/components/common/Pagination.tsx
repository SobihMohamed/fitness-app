"use client"

import { memo, useMemo } from "react"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  total: number
  page: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
}

function range(start: number, end: number): number[] {
  const res: number[] = []
  for (let i = start; i <= end; i++) res.push(i)
  return res
}

export const Pagination = memo(function Pagination({ total, page, pageSize, onPageChange, className = "mt-8 flex items-center justify-center gap-2" }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const pages = useMemo(() => {
    // Simple windowed pagination
    const window = 2
    const start = Math.max(1, page - window)
    const end = Math.min(totalPages, page + window)
    return range(start, end)
  }, [page, totalPages])

  if (totalPages <= 1) return null

  return (
    <div className={className}>
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page === 1}>
        Prev
      </Button>
      {pages[0] > 1 && (
        <>
          <Button variant={1 === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(1)}>1</Button>
          {pages[0] > 2 && <span className="px-1 text-muted-foreground">…</span>}
        </>
      )}
      {pages.map(p => (
        <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(p)}>
          {p}
        </Button>
      ))}
      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Button variant={totalPages === page ? "default" : "outline"} size="sm" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </Button>
        </>
      )}
      <Button variant="outline" size="sm" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
        Next
      </Button>
    </div>
  )
})
