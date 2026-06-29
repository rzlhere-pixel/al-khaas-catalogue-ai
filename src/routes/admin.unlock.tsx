import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { unlockAdmin } from "@/lib/admin-gate.functions";

type Search = { redirect?: string };

export const Route = createFileRoute("/admin/unlock")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Admin · Unlock" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: UnlockPage,
});

function UnlockPage() {
  const router = useRouter();
  const { redirect } = useSearch({ from: "/admin/unlock" });
  const unlock = useServerFn(unlockAdmin);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await unlock({ data: { password } });
      if (!res.ok) {
        setError(
          res.configured === false
            ? "Admin password is not configured on the server."
            : "Incorrect password.",
        );
        return;
      }
      const target =
        redirect && redirect.startsWith("/") ? redirect : "/admin/images";
      await router.navigate({ to: target });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unlock failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <section className="mx-auto flex max-w-md flex-col items-stretch px-6 py-16">
        <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-secondary p-3">
              <Lock className="h-5 w-5 text-foreground" />
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                Internal
              </div>
              <h1 className="font-display text-2xl text-foreground">
                Admin access
              </h1>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Enter the admin password to access internal tools.
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="password"
              autoComplete="current-password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
              required
            />
            {error ? (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={busy || !password}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cocoa text-sm font-semibold text-cream shadow-soft hover:opacity-95 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Unlock
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
