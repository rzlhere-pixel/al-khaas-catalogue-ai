import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ShieldAlert, Loader2, ArrowRight, LogOut } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { supabase } from "@/integrations/supabase/client";
import { getAdminStatus, claimFirstAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Admin · Al Khaas" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminLanding,
});

function AdminLanding() {
  const status = useServerFn(getAdminStatus);
  const claim = useServerFn(claimFirstAdmin);
  const qc = useQueryClient();
  const router = useRouter();

  const q = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => status(),
  });

  const claimM = useMutation({
    mutationFn: () => claim(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-status"] }),
  });

  return (
    <AppShell>
      <section className="mx-auto max-w-2xl px-6 py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Internal
        </div>
        <h1 className="font-display text-3xl text-foreground sm:text-4xl">
          Admin
        </h1>

        {q.isLoading ? (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Checking access…
          </div>
        ) : q.isError ? (
          <div className="mt-8 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            Could not verify access. {(q.error as Error).message}
          </div>
        ) : q.data?.isAdmin ? (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div className="text-sm">You're signed in as an admin.</div>
            </div>
            <Link
              to="/admin/images"
              className="inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-cream shadow-soft hover:opacity-95"
            >
              Bulk product image lookup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              <div className="text-sm">
                Your account doesn't have admin access.
              </div>
            </div>
            {q.data && q.data.adminCount === 0 ? (
              <div className="rounded-2xl border border-border bg-card p-4">
                <div className="text-sm font-medium">No admins exist yet</div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Claim the first admin role for this account. After this, only
                  existing admins can grant further roles (via the database).
                </p>
                <button
                  onClick={() => claimM.mutate()}
                  disabled={claimM.isPending}
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-cocoa px-5 py-2.5 text-sm font-semibold text-cream shadow-soft disabled:opacity-50"
                >
                  {claimM.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : null}
                  Claim admin
                </button>
                {claimM.isError ? (
                  <div className="mt-2 text-xs text-red-700">
                    {(claimM.error as Error).message}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Ask an existing admin to grant your account the admin role.
              </p>
            )}
          </div>
        )}

        <button
          onClick={async () => {
            await supabase.auth.signOut();
            router.navigate({ to: "/auth" });
          }}
          className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground hover:bg-secondary"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </section>
    </AppShell>
  );
}
