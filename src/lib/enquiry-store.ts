import { useEffect, useState, useSyncExternalStore } from "react";

export interface EnquiryLine {
  id: string;
  qty: number;
}

const KEY = "akg_enquiry_v1";
const listeners = new Set<() => void>();

function read(): EnquiryLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => x && typeof x.id === "string" && typeof x.qty === "number");
  } catch {
    return [];
  }
}

function write(lines: EnquiryLine[]) {
  window.localStorage.setItem(KEY, JSON.stringify(lines));
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const handler = (e: StorageEvent) => {
    if (e.key === KEY) l();
  };
  window.addEventListener("storage", handler);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", handler);
  };
}

export function useEnquiry() {
  const lines = useSyncExternalStore(
    subscribe,
    () => {
      // Return same reference when content equal would be nice; instead JSON-cache
      return readCached();
    },
    () => [] as EnquiryLine[],
  );
  return {
    lines,
    add: (id: string, qty = 1) => {
      const cur = read();
      const ex = cur.find((l) => l.id === id);
      if (ex) ex.qty += qty;
      else cur.push({ id, qty });
      write(cur);
    },
    setQty: (id: string, qty: number) => {
      const cur = read();
      const ex = cur.find((l) => l.id === id);
      if (!ex) return;
      if (qty <= 0) write(cur.filter((l) => l.id !== id));
      else {
        ex.qty = qty;
        write(cur);
      }
    },
    remove: (id: string) => write(read().filter((l) => l.id !== id)),
    clear: () => write([]),
    has: (id: string) => lines.some((l) => l.id === id),
  };
}

// Cache to keep useSyncExternalStore happy with stable references
let cached: EnquiryLine[] = [];
let cachedJson = "";
function readCached(): EnquiryLine[] {
  const arr = read();
  const json = JSON.stringify(arr);
  if (json !== cachedJson) {
    cached = arr;
    cachedJson = json;
  }
  return cached;
}

export function useEnquiryCount() {
  const { lines } = useEnquiry();
  return lines.reduce((s, l) => s + l.qty, 0);
}

export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
