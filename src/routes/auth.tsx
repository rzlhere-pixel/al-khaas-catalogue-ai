import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";

type Search = { redirect?: string };

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>): Search => ({
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · Al Khaas" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const router = useRouter();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        const target =
          redirect && redirect.startsWith("/") ? redirect : "/";
        router.navigate({ to: target });
      }
    });
  }, [redirect, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const fn =
        mode === "signin"
          ? supabase.auth.signInWithPassword({ email, password })
          : supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin },
            });
      const { data, error: authErr } = await fn;
      if (authErr) {
        setError(authErr.message);
        return;
      }
      if (!data.session) {
        setInfo("Check your email to confirm your account, then sign in.");
        return;
      }
      const target = redirect && redirect.startsWith("/") ? redirect : "/";
      await router.navigate({ to: target });
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
                Account
              </div>
              <h1 className="font-display text-2xl text-foreground">
                {mode === "signin" ? "Sign in" : "Create account"}
              </h1>
            </div>
          </div>
          <form onSubmit={onSubmit} className="mt-6 space-y-3">
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
            />
            <input
              type="password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm"
            />
            {error ? (
              <div className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            ) : null}
            {info ? (
              <div className="rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {info}
              </div>
            ) : null}
            <button
              type="submit"
              disabled={busy || !email || !password}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-cocoa text-sm font-semibold text-cream shadow-soft hover:opacity-95 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === "signin" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button
            type="button"
            onClick={() =>
              setMode((m) => (m === "signin" ? "signup" : "signin"))
            }
            className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground"
          >
            {mode === "signin"
              ? "Need an account? Create one"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
