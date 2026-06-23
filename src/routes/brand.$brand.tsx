import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { ALL_BRANDS, brandPalette, productsByBrand } from "@/lib/catalog";

export const Route = createFileRoute("/brand/$brand")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.brand} — Al Khaas Catalogue` },
      { name: "description", content: `${params.brand} products available from Al Khaas General Trading.` },
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
        <h1 className="font-display text-3xl">Brand not found</h1>
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
          <div className="mt-3 text-sm opacity-80">{products.length} products in catalogue</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </AppShell>
  );
}
