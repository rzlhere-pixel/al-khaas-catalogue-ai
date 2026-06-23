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
      <ProductImage name={p.name} brand={p.brand} className="aspect-square w-full" rounded="rounded-none" />
      <div className="p-3 sm:p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.brand}</div>
        <h3 className="mt-1 line-clamp-2 text-sm font-medium leading-snug text-foreground sm:text-[15px]">
          {p.name}
        </h3>
        <div className="mt-3 flex items-end justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {p.casePrice != null ? "Case" : p.outerPrice != null ? "Outer" : "Piece"}
            </div>
            <div className="font-display text-lg text-foreground">{formatPrice(price)}</div>
          </div>
          <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
            {p.itemCode || "—"}
          </span>
        </div>
      </div>
    </Link>
  );
}
