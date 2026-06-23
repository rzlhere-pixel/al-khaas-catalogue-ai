import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-chocolates.jpg";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import {
  ALL_BRANDS,
  ALL_CATEGORIES,
  bestSellers,
  brandPalette,
  newArrivals,
  productsByBrand,
  promos,
} from "@/lib/catalog";
import { ArrowRight, Sparkles, Truck, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Al Khaas — Premium Confectionery Catalogue" },
      {
        name: "description",
        content:
          "Discover Ferrero, Kinder, Cadbury, Mars, Nestlé, Lindt and more — distributed across the UAE by Al Khaas General Trading.",
      },
    ],
  }),
  component: Home,
});

const FEATURED_BRANDS = [
  "Ferrero Rocher",
  "Kinder",
  "Nutella",
  "Cadbury",
  "Mars",
  "Nestle",
  "Lindt",
  "Haribo",
  "Lotus",
  "Tic Tac",
];

function Home() {
  const sellers = bestSellers(12);
  const arrivals = newArrivals(8);
  const offers = promos(8);

  return (
    <AppShell>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={heroImg}
            alt=""
            width={1536}
            height={1024}
            className="h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-cocoa/95 via-cocoa/80 to-cocoa/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-cocoa/70 via-transparent to-transparent" />
        </div>
        <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 sm:pb-28 sm:pt-24 lg:pt-32">
          <div className="max-w-2xl text-cream">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-cocoa/40 px-3 py-1 text-[11px] uppercase tracking-[0.25em] text-gold backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5" /> Official Catalogue · 2026
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] sm:text-5xl lg:text-6xl">
              The taste of the world,<br />
              <span className="text-gold">delivered across the UAE.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-cream/85 sm:text-lg">
              Browse 280+ premium confectionery and FMCG products from Ferrero, Kinder, Cadbury,
              Mars, Nestlé, Lindt and more. Send your enquiry to our nearest sales team on
              WhatsApp in seconds.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground shadow-gold hover:brightness-105"
              >
                Browse the catalogue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/visit"
                className="inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/5 px-5 py-3 text-sm font-medium text-cream backdrop-blur-sm hover:bg-cream/10"
              >
                Request a shop visit
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-cream/80">
              <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-gold" /> Dubai · Al Ain · UAE-wide wholesale</div>
              <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-gold" /> Authorised distributor</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
        <SectionHeader eyebrow="Shop by" title="Categories" href="/categories" />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ALL_CATEGORIES.map((c) => (
            <CategoryTile key={c} cat={c} />
          ))}
        </div>
      </section>

      {/* FEATURED BRANDS */}
      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
          <SectionHeader eyebrow="Featured" title="Brands we distribute" href="/brands" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {FEATURED_BRANDS.filter((b) => ALL_BRANDS.includes(b)).map((b) => {
              const palette = brandPalette(b);
              const count = productsByBrand(b).length;
              return (
                <Link
                  key={b}
                  to="/brand/$brand"
                  params={{ brand: b }}
                  className="card-hover group relative aspect-[5/3] overflow-hidden rounded-2xl shadow-soft"
                  style={{ background: `linear-gradient(135deg, ${palette.from}, ${palette.to})`, color: palette.ink }}
                >
                  <div className="absolute inset-0 flex flex-col justify-end p-4">
                    <div className="font-display text-xl tracking-tight">{b}</div>
                    <div className="text-[11px] uppercase tracking-[0.18em] opacity-80">
                      {count} products
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
        <SectionHeader eyebrow="Customer favourites" title="Best sellers" href="/categories" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sellers.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* PROMOS */}
      {offers.length > 0 && (
        <section className="border-y border-border bg-cocoa text-cream">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-[0.25em] text-gold">Limited time</div>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl">Promotional packs</h2>
              </div>
              <Link to="/search" search={{ q: "offer" }} className="hidden text-sm text-cream/80 hover:text-gold sm:inline">
                See all →
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {offers.map((p) => (
                <Link
                  key={p.id}
                  to="/product/$id"
                  params={{ id: p.id }}
                  className="card-hover block rounded-2xl bg-cream/5 backdrop-blur-sm overflow-hidden border border-cream/10"
                >
                  <ProductImage name={p.name} brand={p.brand} className="aspect-square w-full" rounded="rounded-none" />
                  <div className="p-3">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-gold">{p.brand}</div>
                    <div className="mt-1 line-clamp-2 text-sm">{p.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* NEW ARRIVALS */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:py-20">
        <SectionHeader eyebrow="Fresh listings" title="New arrivals" href="/categories" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {arrivals.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-cocoa to-[#3a2618] p-8 text-cream shadow-lift sm:p-12">
          <div className="grid items-center gap-6 sm:grid-cols-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-gold">For trade & retail</div>
              <h3 className="mt-2 font-display text-3xl sm:text-4xl">
                Send your enquiry on WhatsApp.
              </h3>
              <p className="mt-3 max-w-md text-sm text-cream/85">
                Add the products you need, pick the nearest sales contact, and we'll reach out with
                pricing and availability — usually within the hour.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 sm:justify-end">
              <Link to="/enquiry" className="inline-flex items-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-gold-foreground hover:brightness-105">
                Open my enquiry
              </Link>
              <Link to="/visit" className="inline-flex items-center gap-2 rounded-full border border-cream/30 px-5 py-3 text-sm font-medium hover:bg-cream/10">
                Request shop visit
              </Link>
            </div>
          </div>
        </div>
      </section>
    </AppShell>
  );
}

function SectionHeader({ eyebrow, title, href }: { eyebrow: string; title: string; href: string }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{eyebrow}</div>
        <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">{title}</h2>
        <div className="gold-divider mt-3 w-16" />
      </div>
      <Link to={href} className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">
        See all →
      </Link>
    </div>
  );
}

const CATEGORY_ICON: Record<string, string> = {
  Chocolates: "🍫",
  "Biscuits & Cookies": "🍪",
  "Candy & Gummies": "🍬",
  Wafers: "🥮",
  "Gum & Mints": "🌿",
  Beverages: "🥤",
  Spreads: "🫙",
  Accessories: "🧾",
  Other: "✨",
};

function CategoryTile({ cat }: { cat: string }) {
  return (
    <Link
      to="/category/$cat"
      params={{ cat }}
      className="card-hover group flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-soft"
    >
      <div>
        <div className="font-display text-lg text-foreground">{cat}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">Browse →</div>
      </div>
      <span className="text-3xl">{CATEGORY_ICON[cat] ?? "✨"}</span>
    </Link>
  );
}
