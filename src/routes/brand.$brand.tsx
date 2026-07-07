import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { ALL_BRANDS, brandPalette, productsByBrand } from "@/lib/catalog";

export const Route = createFileRoute("/brand/$brand")({
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

function BrandPage() {
  const { brand } = Route.useLoaderData();
  const products = productsByBrand(brand);
  const palette = brandPalette(brand);
  
  return (
    <AppShell>
      <section
        className="relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, color: palette.ink }}
      >
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <div className="text-[11px] uppercase tracking-[0.25em] opacity-80">Brand</div>
          <h1 className="mt-2 font-display text-5xl sm:text-6xl">{brand}</h1>
          <div className="mt-3 text-sm opacity-80">
            {products.length} {products.length === 1 ? "product" : "products"} in catalogue
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            No products from {brand} at the moment.
          </div>
        )}
      </section>
    </AppShell>
  );
}
