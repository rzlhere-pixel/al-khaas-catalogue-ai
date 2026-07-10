import { PRODUCTS, type Product } from "@/data/products";

export const BRAND_COLORS: Record<string, { from: string; to: string; ink: string }> = {
  "Ferrero Rocher": { from: "#3d2410", to: "#7a4a1f", ink: "#f5e3b8" },
  Kinder: { from: "#8b1a1a", to: "#c8312e", ink: "#fff" },
  Nutella: { from: "#3a1c0e", to: "#6b2b14", ink: "#f7e6c5" },
  "Tic Tac": { from: "#fff", to: "#e8eef7", ink: "#1a3a8a" },
  Cadbury: { from: "#2d1b5e", to: "#4b2a8a", ink: "#fff" },
  Mars: { from: "#1a1a1a", to: "#c8102e", ink: "#fff" },
  Nestle: { from: "#b4001f", to: "#7a0014", ink: "#fff" },
  Tiffany: { from: "#0a3d62", to: "#1a6fa5", ink: "#fff" },
  Hershey: { from: "#5d2a14", to: "#8c3f1f", ink: "#fff" },
  Lindt: { from: "#7a0f1f", to: "#b81f2d", ink: "#f5d98a" },
  Loacker: { from: "#fff", to: "#f5e9d5", ink: "#7a2218" },
  Lotus: { from: "#7a3a16", to: "#b85d22", ink: "#fff" },
  Haribo: { from: "#f3c50e", to: "#f59a0e", ink: "#5b3a00" },
  "Chupa Chups": { from: "#e8345a", to: "#f5b81f", ink: "#fff" },
  "Wrigley Extra": { from: "#0a5a8a", to: "#1a8fbf", ink: "#fff" },
  "Red Bull": { from: "#001a4d", to: "#003a8a", ink: "#f5d800" },
  Casabite: { from: "#2c1810", to: "#5a3520", ink: "#f5e3b8" },
  "Sour Punk": { from: "#1a1a1a", to: "#4a4a4a", ink: "#bfff3a" },
  Ulker: { from: "#003a8a", to: "#0066cc", ink: "#fff" },
  "Choki Choki": { from: "#5a2a14", to: "#8c4520", ink: "#fff" },
  Safari: { from: "#3a2a14", to: "#7a5a2c", ink: "#fff" },
  Astor: { from: "#5a2a14", to: "#8c4520", ink: "#fff" },
  Sando: { from: "#1f4a8a", to: "#3a6fbf", ink: "#fff" },
  Barni: { from: "#7a4520", to: "#b8682c", ink: "#fff" },
  Alpenliebe: { from: "#c8302e", to: "#f59a0e", ink: "#fff" },
  "Chips Ahoy": { from: "#1a5fbf", to: "#3a8ce0", ink: "#fff" },
  "Private Label": { from: "#4a4a6a", to: "#6a6a9a", ink: "#fff" },
  Other: { from: "#2c1810", to: "#5a3520", ink: "#f5e3b8" },
};

export function brandPalette(brand: string) {
  return BRAND_COLORS[brand] ?? BRAND_COLORS.Other;
}

// --- Precomputed indexes to avoid repeated O(N) scans ---
const PRODUCT_BY_ID: Map<string, Product> = new Map();
const BRAND_INDEX: Map<string, Product[]> = new Map();
const CATEGORY_INDEX: Map<string, Product[]> = new Map();
const SEARCH_TEXT: Map<string, string> = new Map();

for (const p of PRODUCTS) {
  PRODUCT_BY_ID.set(p.id, p);
  if (!BRAND_INDEX.has(p.brand)) BRAND_INDEX.set(p.brand, []);
  BRAND_INDEX.get(p.brand)!.push(p);
  if (!CATEGORY_INDEX.has(p.category)) CATEGORY_INDEX.set(p.category, []);
  CATEGORY_INDEX.get(p.category)!.push(p);
  // Precompute a normalized searchable string once
  // Precompute a normalized searchable string once (includes subtitle/weight)
  SEARCH_TEXT.set(
    p.id,
    `${p.displayName} ${p.name} ${p.itemCode} ${p.barcode} ${p.brand} ${p.category} ${p.subtitle ?? ""} ${p.packaging ?? ""}`
      .toLowerCase()
      .replace(/[·\-_/]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

// Precompute some commonly used derived lists
const PROMO_LIST: Product[] = PRODUCTS.filter((p) => p.is_promo === true);
const NEW_ARRIVALS_SORTED: Product[] = PRODUCTS.filter((p) => p.itemCode.startsWith("AKG")).sort((a, b) => b.itemCode.localeCompare(a.itemCode));

// Helper for best sellers ordering
const BEST_ORDER = ["Ferrero Rocher", "Kinder", "Cadbury", "Mars", "Nestle", "Nutella", "Lindt", "Haribo", "Lotus", "Tic Tac"];
const BEST_ORDER_MAP = new Map(BEST_ORDER.map((b, i) => [b, i]));

export function getProduct(id: string): Product | undefined {
  return PRODUCT_BY_ID.get(id);
}

export function searchProducts(q: string, limit = 50): Product[] {
  const term = q.trim().toLowerCase();
  if (!term) return [];
  const tokens = term.split(/\s+/);
  const matches: Product[] = [];
  for (const [id, hay] of SEARCH_TEXT.entries()) {
    if (tokens.every((t) => hay.includes(t))) {
      const p = PRODUCT_BY_ID.get(id)!;
      matches.push(p);
      if (matches.length >= limit) break;
    }
  }
  return matches;
}

// Exclude Accessories and Beverages from public-facing category lists
const HIDDEN_CATEGORIES = new Set(["Accessories", "Beverages"]);

export const ALL_BRANDS = Array.from(new Set(PRODUCTS.map((p) => p.brand))).sort();
export const ALL_CATEGORIES = Array.from(
  new Set(PRODUCTS.filter((p) => !HIDDEN_CATEGORIES.has(p.category)).map((p) => p.category))
).sort();

export function productsByCategory(cat: string) {
  return CATEGORY_INDEX.get(cat) ?? [];
}
export function productsByBrand(brand: string) {
  return BRAND_INDEX.get(brand) ?? [];
}

export function relatedProducts(p: Product, limit = 8): Product[] {
  const sameBrand = (BRAND_INDEX.get(p.brand) ?? []).filter((x) => x.id !== p.id);
  const sameCat = (CATEGORY_INDEX.get(p.category) ?? []).filter((x) => x.id !== p.id && x.brand !== p.brand);
  return [...sameBrand, ...sameCat].slice(0, limit);
}

export function alternatives(p: Product, limit = 6): { premium: Product[]; budget: Product[] } {
  const ref = p.casePrice ?? p.piecePrice ?? 0;
  const peers = (CATEGORY_INDEX.get(p.category) ?? []).filter((x) => x.id !== p.id);
  const withPrice = peers.map((x) => ({ x, price: x.casePrice ?? x.piecePrice ?? 0 })).filter((r) => r.price > 0);
  const premium = withPrice.filter((r) => r.price > ref).sort((a, b) => a.price - b.price).slice(0, limit).map((r) => r.x);
  const budget = withPrice.filter((r) => r.price < ref).sort((a, b) => b.price - a.price).slice(0, limit).map((r) => r.x);
  return { premium, budget };
}

export function bestSellers(limit = 12): Product[] {
  // Use brand index and order map to avoid repeated indexOf/filters
  const result: Product[] = [];
  const brandCount: Record<string, number> = {};

  for (const brand of BEST_ORDER) {
    const items = BRAND_INDEX.get(brand) ?? [];
    for (const p of items) {
      if ((brandCount[brand] || 0) >= 2) break;
      result.push(p);
      brandCount[brand] = (brandCount[brand] || 0) + 1;
      if (result.length >= limit) return result;
    }
  }
  return result;
}

export function newArrivals(limit = 8) {
  return NEW_ARRIVALS_SORTED.slice(0, limit);
}

export function promos(limit = 8) {
  return PROMO_LIST.slice(0, limit);
}

export function formatPrice(v: number | null) {
  if (v == null) return "—";
  return `AED ${v.toFixed(2)}`;
}
