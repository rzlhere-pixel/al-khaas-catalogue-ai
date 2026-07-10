import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { FilterChips, applyFilters, useCatalogFilters, type CatalogFilters } from "@/components/filter-chips";
import { ALL_BRANDS, brandLogo, brandPalette, productsByBrand, bestSellers, newArrivals } from "@/lib/catalog";

export const Route = createFileRoute("/brand/$brand")({
  validateSearch: (s: Record<string, unknown>): CatalogFilters => ({
    pack: typeof s.pack === "string" ? s.pack : undefined,
    weight: typeof s.weight === "string" ? s.weight : undefined,
    tag: typeof s.tag === "string" ? s.tag : undefined,
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.brand} — Al Khaas Catalogue` },
      { name: "description", content: `Browse ${params.brand} products available from Al Khaas General Trading. Premium confectionery and FMCG distributed across the UAE.` },
    ],
  }),
  loader: ({ params }) => {
    if (!ALL_BRANDS.includes(params.brand)) throw notFound();
    return { brand: params.brand };
  },
  component: BrandPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-foreground">Brand not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This brand is not available in our catalogue.</p>
        <Link to="/brands" className="mt-4 inline-block text-sm text-gold hover:text-gold/80">
          ← Back to brands
        </Link>
      </div>
    </AppShell>
  ),
});

function HeroLogo({ brand, logo }: { brand: string; logo: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="mt-3 inline-flex h-16 w-28 items-center justify-center rounded-xl bg-white/95 p-3 shadow-sm">
      <img
        src={logo}
        alt={`${brand} logo`}
        className="max-h-full max-w-full object-contain"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const search = Route.useSearch();
  const { filters, setFilters } = useCatalogFilters(search);
  const all = productsByBrand(brand);
  const palette = brandPalette(brand);
  const logo = brandLogo(brand);
  const newIds = useMemo(() => new Set(newArrivals(200).map((p) => p.id)), []);
  const bestIds = useMemo(() => new Set(bestSellers(50).map((p) => p.id)), []);
  const filtered = useMemo(
    () => applyFilters(all, filters, { newArrivalIds: newIds, bestSellerIds: bestIds }),
    [all, filters, newIds, bestIds],
  );

  return (
    <AppShell>
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, color: palette.ink }}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="text-[11px] uppercase tracking-[0.25em] opacity-80">Brand</div>
          {logo ? <HeroLogo brand={brand} logo={logo} /> : null}
          <h1 className="mt-2 font-display text-5xl sm:text-6xl">{brand}</h1>
          <div className="mt-3 text-sm opacity-80">
            {all.length} {all.length === 1 ? "product" : "products"} in catalogue
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <FilterChips products={all} filters={filters} onChange={setFilters} showBrand={false} />
        <div className="mt-3 text-xs text-muted-foreground">
          {filtered.length} of {all.length} shown
        </div>
        {filtered.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            No products match the current filters.
          </div>
        )}
      </section>
    </AppShell>
  );
}

