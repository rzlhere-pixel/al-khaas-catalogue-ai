import { Link } from "@tanstack/react-router";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/catalog";
import type { Product } from "@/data/products";

export function ProductCard({ p }: { p: Product }) {
  const price = p.casePrice ?? p.outerPrice ?? p.piecePrice;
  return (
    <Link
      to="/product/$id"
      params={{ id: p.id }}
      className="card-hover group block rounded-2xl bg-card shadow-soft overflow-hidden border border-border/60"
    >
      <div className="relative">
        <ProductImage productId={p.id} name={p.displayName} brand={p.brand} className="aspect-square w-full" rounded="rounded-none" />
        {p.is_promo && (
          <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-gold-foreground shadow-sm">
            Promo
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.brand}</div>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground sm:text-[15px]">
          {p.displayName}
        </h3>
        {p.subtitle && <div className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{p.subtitle}</div>}
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {p.casePrice != null ? "Case" : p.outerPrice != null ? "Outer" : "Piece"}
            </div>
            <div className="font-display text-lg text-foreground">{formatPrice(price)}</div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
              {p.itemCode || "—"}
            </span>
            <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground/70">
              <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
              Check availability
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
