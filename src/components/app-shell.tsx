import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useEnquiryCount, useHydrated } from "@/lib/enquiry-store";
import { ALL_CATEGORIES, searchProducts } from "@/lib/catalog";
import { ProductImage } from "@/components/product-image";

function Header() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const count = useEnquiryCount();
  const hydrated = useHydrated();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    setOpen(false);
    setMenu(false);
    setQ("");
  }, [pathname]);

  const results = useMemo(() => (q.trim().length >= 1 ? searchProducts(q, 8) : []), [q]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
        <button
          onClick={() => setMenu((v) => !v)}
          className="rounded-full p-2 text-foreground hover:bg-secondary md:hidden"
          aria-label="Menu"
        >
          {menu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-cocoa text-cream font-display text-base shadow-soft">
            AK
          </span>
          <div className="hidden sm:block leading-none">
            <div className="font-display text-base text-foreground">Al Khaas</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">General Trading</div>
          </div>
        </Link>

        <nav className="ml-3 hidden items-center gap-1 md:flex">
          <Link to="/" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm text-foreground bg-secondary" }} activeOptions={{ exact: true }}>
            Home
          </Link>
          <Link to="/categories" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm text-foreground bg-secondary" }}>
            Categories
          </Link>
          <Link to="/brands" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm text-foreground bg-secondary" }}>
            Brands
          </Link>
          <Link to="/visit" className="rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground" activeProps={{ className: "rounded-full px-3 py-1.5 text-sm text-foreground bg-secondary" }}>
            Shop visit
          </Link>
        </nav>

        <div className="relative ml-auto flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && q.trim()) {
                navigate({ to: "/search", search: { q } });
              }
            }}
            placeholder="Search products, brand, barcode…"
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm shadow-soft outline-none placeholder:text-muted-foreground/80 focus:border-gold focus:ring-2 focus:ring-gold/30"
          />
          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 top-12 max-h-[60vh] overflow-auto rounded-2xl border border-border bg-popover p-2 shadow-lift">
              {results.map((r) => (
                <Link
                  key={r.id}
                  to="/product/$id"
                  params={{ id: r.id }}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary"
                >
                  <ProductImage name={r.name} brand={r.brand} className="h-12 w-12 shrink-0" rounded="rounded-lg" />
                  <div className="min-w-0">
                    <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{r.brand}</div>
                    <div className="truncate text-sm text-foreground">{r.name}</div>
                  </div>
                </Link>
              ))}
              {q && (
                <Link
                  to="/search"
                  search={{ q }}
                  className="mt-1 block rounded-xl border-t border-border px-3 py-2 text-center text-xs text-muted-foreground hover:bg-secondary"
                >
                  See all results for “{q}”
                </Link>
              )}
            </div>
          )}
        </div>

        <Link
          to="/enquiry"
          className="relative inline-flex h-10 items-center gap-2 rounded-full bg-cocoa px-3 text-sm font-medium text-cream shadow-soft hover:opacity-95"
        >
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Enquiry</span>
          {hydrated && count > 0 && (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gold px-1 text-[11px] font-semibold text-gold-foreground shadow-soft">
              {count}
            </span>
          )}
        </Link>
      </div>

      {menu && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
            <div className="flex flex-wrap gap-1.5">
              <Link to="/" className="rounded-full bg-secondary px-3 py-1.5 text-sm">Home</Link>
              <Link to="/categories" className="rounded-full bg-secondary px-3 py-1.5 text-sm">Categories</Link>
              <Link to="/brands" className="rounded-full bg-secondary px-3 py-1.5 text-sm">Brands</Link>
              <Link to="/visit" className="rounded-full bg-secondary px-3 py-1.5 text-sm">Shop visit</Link>
              {ALL_CATEGORIES.slice(0, 6).map((c) => (
                <Link
                  key={c}
                  to="/category/$cat"
                  params={{ cat: c }}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground"
                >
                  {c}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-cocoa text-cream">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-cream text-cocoa font-display">
              AK
            </span>
            <div>
              <div className="font-display text-lg">Al Khaas</div>
              <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">General Trading LLC</div>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">
            Premium confectionery & FMCG distribution across the UAE since over a decade.
          </p>
        </div>
        <div>
          <div className="font-display text-sm uppercase tracking-widest opacity-70">Browse</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/categories" className="opacity-80 hover:opacity-100">Categories</Link></li>
            <li><Link to="/brands" className="opacity-80 hover:opacity-100">Brands</Link></li>
            <li><Link to="/search" search={{ q: "offer" }} className="opacity-80 hover:opacity-100">Promotions</Link></li>
            <li><Link to="/enquiry" className="opacity-80 hover:opacity-100">My enquiry</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-sm uppercase tracking-widest opacity-70">Reach us</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="tel:+97145593046" className="opacity-80 hover:opacity-100">+971 4 559 3046</a></li>
            <li><a href="mailto:info@alkhaasgroup.com" className="opacity-80 hover:opacity-100">info@alkhaasgroup.com</a></li>
            <li><a href="https://www.alkhaasgroup.com" target="_blank" rel="noreferrer" className="opacity-80 hover:opacity-100">alkhaasgroup.com</a></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-sm uppercase tracking-widest opacity-70">Address</div>
          <p className="mt-3 text-sm opacity-80">
            GAL Business Center, 1st Floor<br />
            Dubai Production City<br />
            Dubai, United Arab Emirates
          </p>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs opacity-70 sm:flex-row">
          <div>© {new Date().getFullYear()} Al Khaas General Trading LLC. TRN: 104021349600003.</div>
          <div>Digital catalogue · For customer enquiries only</div>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
