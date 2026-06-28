import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useEnquiryCount, useHydrated } from "@/lib/enquiry-store";
import { ALL_CATEGORIES, searchProducts } from "@/lib/catalog";
import { ProductImage } from "@/components/product-image";
import alkhaasLogo from "@/assets/alkhaas-logo.png.asset.json";


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
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white p-1.5 ring-1 ring-border shadow-soft">
            <img
              src={alkhaasLogo.url}
              alt="Al Khaas General Trading"
              className="h-full w-full object-contain"
            />
          </span>
          <div className="hidden sm:block leading-none">
            <div className="font-display text-lg font-bold text-foreground tracking-tight">Al Khaas</div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground mt-1">General Trading</div>
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
                  <ProductImage productId={r.id} name={r.displayName} brand={r.brand} className="h-12 w-12 shrink-0" rounded="rounded-lg" />
                  <div className="min-w-0">
                    <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{r.brand}</div>
                    <div className="truncate text-sm text-foreground">{r.displayName}</div>
                    {r.subtitle && <div className="truncate text-[11px] text-muted-foreground">{r.subtitle}</div>}
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
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-cream p-1.5 shadow-soft">
              <img src={alkhaasLogo.url} alt="Al Khaas" className="h-full w-full object-contain" />
            </span>
            <div>
              <div className="font-display text-lg font-bold">Al Khaas</div>
              <div className="text-[10px] uppercase tracking-[0.22em] opacity-70">General Trading LLC</div>
            </div>

          </div>
          <p className="mt-4 max-w-xs text-sm opacity-80">
            Trusted FMCG distributor in the UAE — premium confectionery via wholesale, retail & B2B e-commerce.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a href="https://www.instagram.com/3sixtydeals.ae/" target="_blank" rel="noreferrer" aria-label="Instagram" className="opacity-70 hover:opacity-100">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="https://www.facebook.com/profile.php?id=61573348013853" target="_blank" rel="noreferrer" aria-label="Facebook" className="opacity-70 hover:opacity-100">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/3sixtydeals-ae/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="opacity-70 hover:opacity-100">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
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
            GAL Business Center, Galadari Building 16<br />
            1st Floor, Office #14<br />
            Dubai Production City (IMPZ)<br />
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
