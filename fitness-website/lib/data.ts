export function extractArray<T = any>(obj: any, keys: string[] = ["data", "items", "list", "results"]): T[] {
  if (!obj) return [] as T[];
  if (Array.isArray(obj)) return obj as T[];
  for (const k of keys) {
    const v = obj?.[k];
    if (Array.isArray(v)) return v as T[];
  }
  return [] as T[];
}

export function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && !Number.isNaN(value)) return value;
  const n = parseFloat(String(value ?? ""));
  return Number.isFinite(n) ? n : fallback;
}
