import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ALL_BRANDS, brandPalette, productsByBrand } from "@/lib/catalog";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands — Al Khaas Catalogue" },
      { name: "description", content: "Premium global brands distributed by Al Khaas General Trading." },
    ],
  }),
  component: Brands,
});

function Brands() {
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Distribution</div>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">All brands</h1>
        <div className="gold-divider mt-3 w-16" />

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {ALL_BRANDS.map((b) => {
            const palette = brandPalette(b);
            const count = productsByBrand(b).length;
            return (
              <Link
                key={b}
                to="/brand/$brand"
                params={{ brand: b }}
                className="card-hover relative aspect-[4/3] overflow-hidden rounded-2xl shadow-soft"
                style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, color: palette.ink }}
              >
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <div className="font-display text-2xl tracking-tight">{b}</div>
                  <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">{count} products</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
