// Shared deterministic formatting utilities
// Use fixed locale (en-US) and UTC timezone to avoid hydration mismatches

const numberFormatter = new Intl.NumberFormat("en-US", {
  useGrouping: true,
  maximumFractionDigits: 0,
})

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
})

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: "UTC",
})

export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === "string" ? Number(value) : value
  if (n == null || Number.isNaN(n)) return "0"
  return numberFormatter.format(n)
}

export function formatDateUTC(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "N/A"
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return "N/A"
  return dateFormatter.format(d)
}

export function formatDateTimeUTC(dateInput: string | number | Date | null | undefined): string {
  if (!dateInput) return "N/A"
  const d = new Date(dateInput)
  if (Number.isNaN(d.getTime())) return "N/A"
  return dateTimeFormatter.format(d)
}

// Deterministic hash from a string -> 32-bit int
export function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i)
    hash |= 0 // Convert to 32bit integer
  }
  return Math.abs(hash)
}

// Map a string to a deterministic percentage in [min, max]
export function hashPercent(str: string, min = 5, max = 24): number {
  const h = hashString(str)
  const range = Math.max(0, max - min)
  return min + (h % (range + 1))
}

// Deterministic time value for sorting; avoids using Date.now()
// Falls back to Unix epoch when missing/invalid
export function timeOrEpoch(dateInput?: string | number | Date | null): number {
  if (!dateInput) return 0
  const d = new Date(dateInput)
  const t = d.getTime()
  return Number.isNaN(t) ? 0 : t
}
