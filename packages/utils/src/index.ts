// packages/utils/src/index.ts

function resolveApiBase(): string {
  const raw =
    (import.meta as any).env?.VITE_API_BASE ||
    (typeof process !== "undefined" ? (process as any).env?.VITE_API_BASE : undefined) ||
    "http://localhost:8080";

  // Si la app está sirviéndose por HTTPS y la API base empieza por http://,
  // forzamos https:// para evitar Mixed Content.
  if (typeof window !== "undefined" && window.location.protocol === "https:" && raw.startsWith("http://")) {
    return raw.replace(/^http:\/\//, "https://");
  }
  return raw;
}

export const API_BASE = resolveApiBase();

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export const fmtNumber = (n: number) => new Intl.NumberFormat().format(n);
export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat(undefined, { year: "numeric", month: "short", day: "2-digit" }).format(new Date(iso));
