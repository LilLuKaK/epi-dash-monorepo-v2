export const API_BASE =
  (import.meta as any).env?.VITE_API_BASE ||
  (typeof process !== "undefined" ? (process as any).env?.VITE_API_BASE : undefined) ||
  "http://localhost:8080";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const res = await fetch(url, { ...init, headers: { "Content-Type":"application/json", ...(init?.headers||{}) } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
export const fmtNumber = (n:number) => new Intl.NumberFormat().format(n);
export const fmtDate = (iso:string) => new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"2-digit"}).format(new Date(iso));