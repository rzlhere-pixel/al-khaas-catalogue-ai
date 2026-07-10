import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import {
  FilterChips,
  applyFilters,
  useCatalogFilters,
  type CatalogFilters,
} from "@/components/filter-chips";
import { ALL_CATEGORIES, productsByCategory, bestSellers, newArrivals } from "@/lib/catalog";
import { exportCategoryCataloguePdf } from "@/lib/pdf-export";
import { FileDown, Loader2 } from "lucide-react";

const CATEGORY_DESCRIPTION: Record<string, string> = {
  "Chocolate Bars": "Bars, sticks and multipacks",
  "Boxed & Praline Chocolates": "Assortments, pralines and gift boxes",
  "Chocolate Countlines": "Individually wrapped and sharing bags",
  "Chocolate Spreads": "Hazelnut and cocoa spreads",
  "Seasonal & Gift Chocolate": "Eggs, calendars and holiday shapes",
  Wafers: "Light and crispy wafer products",
  "Biscuits & Cookies": "Crispy and delicious biscuit varieties",
  "Candy & Gummies": "Colorful gummies and hard candies",
  "Gum & Mints": "Chewing gums and breath mints",
  Beverages: "Soft drinks and beverage options",
  Spreads: "Hazelnut and other spreads",
};

export const Route = createFileRoute("/category/$cat")({
  validateSearch: (s: Record<string, unknown>): CatalogFilters => ({
    brand: typeof s.brand === "string" ? s.brand : undefined,
    pack: typeof s.pack === "string" ? s.pack : undefined,
    weight: typeof s.weight === "string" ? s.weight : undefined,
    tag: typeof s.tag === "string" ? s.tag : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.cat} — Al Khaas Catalogue` },
      {
        name: "description",
        content: `Browse ${params.cat} from Al Khaas General Trading. Premium confectionery and FMCG products distributed across the UAE.`,
      },
    ],
  }),
  loader: ({ params }) => {
    if (!ALL_CATEGORIES.includes(params.cat)) throw notFound();
    return { cat: params.cat };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-foreground">Category not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This category is not available.</p>
        <Link to="/categories" className="mt-4 inline-block text-sm text-gold hover:text-gold/80">
          ← Back to categories
        </Link>
      </div>
    </AppShell>
  ),
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const search = Route.useSearch();
  const { filters, setFilters } = useCatalogFilters(search);
  const all = productsByCategory(cat);
  const newIds = useMemo(() => new Set(newArrivals(200).map((p) => p.id)), []);
  const bestIds = useMemo(() => new Set(bestSellers(50).map((p) => p.id)), []);
  const filtered = useMemo(
    () => applyFilters(all, filters, { newArrivalIds: newIds, bestSellerIds: bestIds }),
    [all, filters, newIds, bestIds],
  );
  const [exportingPdf, setExportingPdf] = useState(false);

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Category
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="font-display text-4xl text-foreground sm:text-5xl">{cat}</h1>
          <button
            onClick={async () => {
              setExportingPdf(true);
              try {
                await exportCategoryCataloguePdf(
                  cat,
                  CATEGORY_DESCRIPTION[cat] ?? "Browse products",
                  all,
                );
              } finally {
                setExportingPdf(false);
              }
            }}
            disabled={exportingPdf || all.length === 0}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-soft hover:bg-secondary disabled:opacity-60"
          >
            {exportingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            {exportingPdf ? "Preparing PDF…" : "Download catalogue PDF"}
          </button>
        </div>
        <div className="gold-divider mt-3 w-16" />
        <div className="mt-3 text-sm text-muted-foreground">
          {filtered.length} of {all.length} {all.length === 1 ? "product" : "products"}
        </div>

        <FilterChips products={all} filters={filters} onChange={setFilters} showBrand />

        {filtered.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            No products match the current filters.
          </div>
        )}
      </section>
    </AppShell>
  );
}
