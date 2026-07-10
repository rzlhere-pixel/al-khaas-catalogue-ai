import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import type { Product } from "@/data/products";
import { WEIGHT_LABEL, weightBucket, packType, type WeightBucket, type PackType } from "@/lib/catalog";

export interface CatalogFilters {
  brand?: string;
  pack?: string;
  weight?: string;
  tag?: string; // "new" | "best" | "promo"
}

export function applyFilters(products: Product[], f: CatalogFilters, opts: { newArrivalIds?: Set<string>; bestSellerIds?: Set<string> } = {}): Product[] {
  return products.filter((p) => {
    if (f.brand && p.brand !== f.brand) return false;
    if (f.pack && packType(p) !== f.pack) return false;
    if (f.weight && weightBucket(p) !== f.weight) return false;
    if (f.tag === "promo" && !p.is_promo) return false;
    if (f.tag === "new" && opts.newArrivalIds && !opts.newArrivalIds.has(p.id)) return false;
    if (f.tag === "best" && opts.bestSellerIds && !opts.bestSellerIds.has(p.id)) return false;
    return true;
  });
}

interface Props {
  products: Product[];
  filters: CatalogFilters;
  onChange: (f: CatalogFilters) => void;
  showBrand?: boolean;
}

export function FilterChips({ products, filters, onChange, showBrand = true }: Props) {
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand))).sort(),
    [products],
  );
  const packs = useMemo(() => {
    const s = new Set<PackType>();
    for (const p of products) s.add(packType(p));
    return Array.from(s).filter((x) => x !== "Other");
  }, [products]);
  const weights = useMemo(() => {
    const s = new Set<WeightBucket>();
    for (const p of products) {
      const w = weightBucket(p);
      if (w) s.add(w);
    }
    const order: WeightBucket[] = ["u50", "50to150", "150to300", "o300"];
    return order.filter((w) => s.has(w));
  }, [products]);
  const hasPromo = useMemo(() => products.some((p) => p.is_promo), [products]);

  const toggle = <K extends keyof CatalogFilters>(key: K, value: CatalogFilters[K]) => {
    onChange({ ...filters, [key]: filters[key] === value ? undefined : value });
  };
  const clear = () => onChange({});
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      {showBrand && brands.length > 1 && (
        <Group label="Brand">
          {brands.slice(0, 10).map((b) => (
            <Chip key={b} active={filters.brand === b} onClick={() => toggle("brand", b)}>
              {b}
            </Chip>
          ))}
        </Group>
      )}
      {packs.length > 1 && (
        <Group label="Pack">
          {packs.map((p) => (
            <Chip key={p} active={filters.pack === p} onClick={() => toggle("pack", p)}>
              {p}
            </Chip>
          ))}
        </Group>
      )}
      {weights.length > 1 && (
        <Group label="Weight">
          {weights.map((w) => (
            <Chip key={w} active={filters.weight === w} onClick={() => toggle("weight", w)}>
              {WEIGHT_LABEL[w]}
            </Chip>
          ))}
        </Group>
      )}
      <Group label="Tag">
        <Chip active={filters.tag === "new"} onClick={() => toggle("tag", "new")}>New arrivals</Chip>
        <Chip active={filters.tag === "best"} onClick={() => toggle("tag", "best")}>Best sellers</Chip>
        {hasPromo && (
          <Chip active={filters.tag === "promo"} onClick={() => toggle("tag", "promo")}>Promotions</Chip>
        )}
      </Group>
      {activeCount > 0 && (
        <button
          onClick={clear}
          className="ml-1 rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground hover:bg-secondary"
        >
          Clear filters ({activeCount})
        </button>
      )}
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-cocoa bg-cocoa text-cream"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

// Convenience: hook up to route search params
export function useCatalogFilters(search: CatalogFilters) {
  const navigate = useNavigate();
  return {
    filters: search,
    setFilters: (f: CatalogFilters) => {
      navigate({ to: ".", search: f, replace: true });
    },
  };
}
