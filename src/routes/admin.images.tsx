import { createFileRoute, redirect } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProductImage } from "@/components/product-image";
import { PRODUCTS, type Product } from "@/data/products";
import { lookupProductImage } from "@/lib/product-images.functions";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useRef, useState } from "react";
import { Loader2, Play, Square, RefreshCw, CheckCircle2, AlertTriangle, XCircle, LogOut } from "lucide-react";
import { checkAdminUnlocked, lockAdmin } from "@/lib/admin-gate.functions";

export const Route = createFileRoute("/admin/images")({
  head: () => ({
    meta: [
      { title: "Admin · Bulk image lookup" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  beforeLoad: async ({ location }) => {
    const { unlocked } = await checkAdminUnlocked();
    if (!unlocked) {
      throw redirect({
        to: "/admin/unlock",
        search: { redirect: location.href },
      });
    }
  },
  component: AdminImagesPage,
});


type StatusRow = {
  product_id: string;
  status: string;
  confidence: number;
  image_url: string | null;
};

type Mode = "missing" | "all";

const CONCURRENCY = 4;

function AdminImagesPage() {
  const lookup = useServerFn(lookupProductImage);
  const [statuses, setStatuses] = useState<Record<string, StatusRow>>({});
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState<Mode>("missing");
  const [threshold, setThreshold] = useState(0.7);
  const cancelRef = useRef(false);

  // Initial load of existing statuses from DB.
  useMemo(() => {
    (async () => {
      const { data } = await supabase
        .from("product_images")
        .select("product_id, status, confidence, image_url");
      const map: Record<string, StatusRow> = {};
      (data ?? []).forEach((r) => {
        map[r.product_id] = r as StatusRow;
      });
      setStatuses(map);
      setLoadingInitial(false);
    })();
  }, []);

  const queue = useMemo<Product[]>(() => {
    if (mode === "all") return PRODUCTS;
    return PRODUCTS.filter((p) => {
      const s = statuses[p.id];
      return !s || s.status !== "found" || s.confidence < threshold;
    });
  }, [mode, statuses, threshold]);

  const counts = useMemo(() => {
    let found = 0,
      low = 0,
      missing = 0,
      err = 0;
    for (const p of PRODUCTS) {
      const s = statuses[p.id];
      if (!s) missing++;
      else if (s.status === "found" && s.confidence >= threshold) found++;
      else if (s.status === "error" || s.status === "invalid_url") err++;
      else low++;
    }
    return { found, low, missing, err };
  }, [statuses, threshold]);

  async function start() {
    cancelRef.current = false;
    setRunning(true);
    setDone(0);
    const list = [...queue];
    setTotal(list.length);

    let idx = 0;
    const worker = async () => {
      while (!cancelRef.current) {
        const i = idx++;
        if (i >= list.length) return;
        const p = list[i];
        try {
          const row = await lookup({
            data: {
              productId: p.id,
              name: p.displayName || p.name,
              brand: p.brand,
              category: p.category,
              packaging: p.packaging || p.subtitle || "",
            },
          });
          setStatuses((prev) => ({ ...prev, [p.id]: row as StatusRow }));
        } catch (e) {
          setStatuses((prev) => ({
            ...prev,
            [p.id]: {
              product_id: p.id,
              status: "error",
              confidence: 0,
              image_url: null,
            },
          }));
        } finally {
          setDone((d) => d + 1);
        }
      }
    };

    await Promise.all(Array.from({ length: CONCURRENCY }, worker));
    setRunning(false);
  }

  function stop() {
    cancelRef.current = true;
  }

  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <AppShell>
      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Internal · Admin</div>
            <h1 className="font-display text-3xl text-foreground sm:text-4xl">Bulk product image lookup</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Re-fetches verified hi-res product photos via AI and stores them in the catalogue. Verified images
              automatically replace the low-resolution thumbnails everywhere in the app.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!running ? (
              <button
                onClick={start}
                disabled={loadingInitial || queue.length === 0}
                className="inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-cream shadow-soft hover:opacity-95 disabled:opacity-50"
              >
                <Play className="h-4 w-4" />
                Start lookup ({queue.length})
              </button>
            ) : (
              <button
                onClick={stop}
                className="inline-flex items-center gap-2 rounded-full bg-destructive px-5 py-2.5 text-sm font-semibold text-destructive-foreground shadow-soft"
              >
                <Square className="h-4 w-4" />
                Stop
              </button>
            )}
            <LockButton />
          </div>

        </div>

        {/* Controls */}
        <div className="mt-6 grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-3">
          <label className="text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Mode</div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as Mode)}
              disabled={running}
              className="mt-1 h-10 w-full rounded-xl border border-border bg-background px-3 text-sm"
            >
              <option value="missing">Only missing / low confidence</option>
              <option value="all">All {PRODUCTS.length} products (force refresh)</option>
            </select>
          </label>
          <label className="text-sm">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Confidence threshold ({threshold.toFixed(2)})
            </div>
            <input
              type="range"
              min={0.3}
              max={0.95}
              step={0.05}
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              disabled={running}
              className="mt-3 w-full"
            />
          </label>
          <div className="flex items-end">
            <div className="grid w-full grid-cols-4 gap-2 text-center text-xs">
              <Pill label="Found" value={counts.found} tone="ok" />
              <Pill label="Low" value={counts.low} tone="warn" />
              <Pill label="Missing" value={counts.missing} tone="muted" />
              <Pill label="Errors" value={counts.err} tone="bad" />
            </div>
          </div>
        </div>

        {/* Progress */}
        {(running || done > 0) && (
          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span>
                  {done} / {total} processed
                </span>
              </div>
              <span className="text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-gold transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}

        {/* Grid preview */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {PRODUCTS.slice(0, 60).map((p) => {
            const s = statuses[p.id];
            return (
              <div key={p.id} className="rounded-2xl border border-border bg-card p-2">
                <ProductImage productId={p.id} name={p.displayName} brand={p.brand} />
                <div className="mt-2 px-1">
                  <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{p.brand}</div>
                  <div className="line-clamp-2 text-sm">{p.displayName}</div>
                  <StatusBadge s={s} threshold={threshold} />
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Showing first 60 products — bulk lookup processes the entire catalogue.
        </p>
      </section>
    </AppShell>
  );
}

function LockButton() {
  const lock = useServerFn(lockAdmin);
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        setBusy(true);
        try {
          await lock();
        } finally {
          window.location.href = "/admin/unlock";
        }
      }}
      disabled={busy}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground hover:bg-secondary disabled:opacity-50"
      title="Lock admin"
    >
      <LogOut className="h-4 w-4" />
      Lock
    </button>
  );
}


function Pill({ label, value, tone }: { label: string; value: number; tone: "ok" | "warn" | "bad" | "muted" }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-100 text-emerald-900"
      : tone === "warn"
        ? "bg-amber-100 text-amber-900"
        : tone === "bad"
          ? "bg-red-100 text-red-900"
          : "bg-secondary text-foreground";
  return (
    <div className={`rounded-xl px-2 py-2 ${cls}`}>
      <div className="text-lg font-semibold leading-none">{value}</div>
      <div className="mt-1 text-[10px] uppercase tracking-wider opacity-80">{label}</div>
    </div>
  );
}

function StatusBadge({ s, threshold }: { s?: StatusRow; threshold: number }) {
  if (!s) return <div className="mt-1 text-[11px] text-muted-foreground">No lookup yet</div>;
  if (s.status === "found" && s.confidence >= threshold)
    return (
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-700">
        <CheckCircle2 className="h-3 w-3" /> Verified · {(s.confidence * 100).toFixed(0)}%
      </div>
    );
  if (s.status === "error" || s.status === "invalid_url")
    return (
      <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-red-700">
        <XCircle className="h-3 w-3" /> {s.status}
      </div>
    );
  return (
    <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-amber-700">
      <AlertTriangle className="h-3 w-3" /> Low · {(s.confidence * 100).toFixed(0)}%
    </div>
  );
}
