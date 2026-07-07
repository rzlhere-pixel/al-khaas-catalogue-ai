import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { searchProducts } from "@/lib/catalog";
import { Search, AlertCircle } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>) => ({ q: typeof s.q === "string" ? s.q : "" }),
  head: () => ({
    meta: [
      { title: "Search — Al Khaas Catalogue" },
      { name: "description", content: "Search the Al Khaas product catalogue by name, brand, item code, or barcode." },
      { name: "robots", content: "noindex,follow" },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = Route.useSearch();
  const navigate = useNavigate();
  const [value, setValue] = useState(q);
  const results = searchProducts(q, 200);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Search</div>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Find a product</h1>
        <div className="gold-divider mt-3 w-16" />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (value.trim()) {
              navigate({ to: "/search", search: { q: value } });
            }
          }}
          className="relative mt-8 max-w-2xl"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Search by name, brand, item code, barcode…"
            className="h-14 w-full rounded-full border border-border bg-card pl-12 pr-4 text-base shadow-soft outline-none placeholder:text-muted-foreground focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
        </form>

        {q.trim() ? (
          <>
            <div className="mt-6 text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? "result" : "results"} for <strong>"{q}"</strong>
            </div>
            {results.length > 0 ? (
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {results.map((p) => <ProductCard key={p.id} p={p} />)}
              </div>
            ) : (
              <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-amber-600" />
                <p className="mt-3 text-sm text-amber-900">
                  <strong>No products matched.</strong> Try a different keyword, brand, item code, or barcode.
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-6 text-sm text-muted-foreground">
            <p>Start typing to search across 280+ products.</p>
            <p className="mt-2 text-xs opacity-75">Search by product name, brand, item code, barcode, or category.</p>
          </div>
        )}
      </section>
    </AppShell>
  );
}
