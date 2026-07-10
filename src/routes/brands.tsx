import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useState } from "react";
import { ALL_BRANDS, brandLogo, brandPalette, productsByBrand } from "@/lib/catalog";

export const Route = createFileRoute("/brands")({
  head: () => ({
    meta: [
      { title: "Brands — Al Khaas Catalogue" },
      {
        name: "description",
        content:
          "Browse premium global brands — Ferrero, Kinder, Cadbury, Mars, Nestlé, Lindt and more — distributed by Al Khaas General Trading.",
      },
    ],
  }),
  component: Brands,
});

function BrandLogoChip({ brand, logo }: { brand: string; logo: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <div className="mb-3 inline-flex h-12 w-20 items-center justify-center rounded-lg bg-white/95 p-2 shadow-sm">
      <img
        src={logo}
        alt={`${brand} logo`}
        className="max-h-full max-w-full object-contain"
        loading="lazy"
        onError={() => setFailed(true)}
      />
    </div>
  );
}

function Brands() {
  const brands = ALL_BRANDS;

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Our Partners
        </div>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Premium brands</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          We distribute premium confectionery and FMCG products from the world's most trusted
          brands. Click on any brand to explore our range.
        </p>
        <div className="gold-divider mt-3 w-16" />

        {brands.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => {
              const palette = brandPalette(brand);
              const count = productsByBrand(brand).length;
              const logo = brandLogo(brand);
              return (
                <Link
                  key={brand}
                  to="/brand/$brand"
                  params={{ brand }}
                  className="card-hover group rounded-2xl border border-border shadow-soft overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`,
                    color: palette.ink,
                  }}
                >
                  <div className="p-6 flex flex-col justify-between h-full">
                    <div>
                      {logo ? <BrandLogoChip brand={brand} logo={logo} /> : null}
                      <h3 className="font-display text-2xl tracking-tight">{brand}</h3>
                      <p className="mt-2 text-sm opacity-80">{count} products available</p>
                    </div>
                    <div className="mt-4 inline-flex text-sm font-medium opacity-70 group-hover:opacity-100">
                      Browse →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            No brands available at the moment.
          </div>
        )}
      </section>
    </AppShell>
  );
}
