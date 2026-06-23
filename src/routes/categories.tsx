import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ALL_CATEGORIES, productsByCategory } from "@/lib/catalog";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Al Khaas Catalogue" },
      { name: "description", content: "Browse chocolates, biscuits, candy, wafers, gum and more." },
    ],
  }),
  component: Categories,
});

function Categories() {
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Catalogue</div>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">All categories</h1>
        <div className="gold-divider mt-3 w-16" />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_CATEGORIES.map((c) => {
            const items = productsByCategory(c).slice(0, 3);
            return (
              <Link
                key={c}
                to="/category/$cat"
                params={{ cat: c }}
                className="card-hover group rounded-3xl border border-border bg-card p-5 shadow-soft"
              >
                <div className="flex items-end justify-between">
                  <div>
                    <div className="font-display text-2xl text-foreground">{c}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{productsByCategory(c).length} products</div>
                  </div>
                  <span className="text-3xl opacity-70 group-hover:opacity-100">→</span>
                </div>
                <ul className="mt-5 space-y-1.5 text-sm text-muted-foreground">
                  {items.map((p) => (
                    <li key={p.id} className="line-clamp-1">• {p.name}</li>
                  ))}
                </ul>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
