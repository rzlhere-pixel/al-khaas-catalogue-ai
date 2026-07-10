import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ALL_CATEGORIES, productsByCategory } from "@/lib/catalog";

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

const CATEGORY_ICON: Record<string, string> = {
  "Chocolate Bars": "🍫",
  "Boxed & Praline Chocolates": "🎁",
  "Chocolate Countlines": "🍬",
  "Chocolate Spreads": "🍯",
  "Seasonal & Gift Chocolate": "🎀",
  Wafers: "🥮",
  "Biscuits & Cookies": "🍪",
  "Candy & Gummies": "🍭",
  "Gum & Mints": "🌿",
  Beverages: "🥤",
  Spreads: "🫙",
};

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "Categories — Al Khaas Catalogue" },
      { name: "description", content: "Browse chocolates, biscuits, candy, wafers, gum, mints, spreads and more from Al Khaas." },
    ],
  }),
  component: Categories,
});

function Categories() {
  const categories = ALL_CATEGORIES;

  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Shop by</div>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">Categories</h1>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">Browse all product categories from Al Khaas General Trading. Find everything from premium chocolates to specialty candies.</p>
        <div className="gold-divider mt-3 w-16" />

        {categories.length > 0 ? (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat) => {
              const count = productsByCategory(cat).length;
              return (
                <Link
                  key={cat}
                  to="/category/$cat"
                  params={{ cat }}
                  className="card-hover group rounded-2xl border border-border bg-card p-6 shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-2xl text-foreground">{cat}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{CATEGORY_DESCRIPTION[cat] ?? "Browse products"}</p>
                      <p className="mt-3 text-sm font-medium text-gold">{count} products</p>
                    </div>
                    <span className="text-4xl">{CATEGORY_ICON[cat] ?? "✨"}</span>
                  </div>
                  <div className="mt-4 inline-flex text-sm text-muted-foreground group-hover:text-foreground">Explore →</div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-border bg-secondary/40 p-8 text-center text-sm text-muted-foreground">
            No categories available at the moment.
          </div>
        )}
      </section>
    </AppShell>
  );
}
