## Goal

Replace warehouse shorthand (e.g. `F COLLEC T24X4 - 269.4 Gr`) with readable two-line titles across the catalogue:

- **Display name**: `Ferrero Collection Box`
- **Subtitle**: `24×4 · 269g`

Original `name` and `packaging` stay on the record (search still matches the raw SKU text); UI reads new fields.

## Changes

### 1. Data model — `src/data/products.ts`

Extend the `Product` interface:

```ts
export interface Product {
  // ...existing
  displayName: string;   // cleaned, human-readable
  subtitle: string;      // pack size + weight, e.g. "24×4 · 269g"
}
```

### 2. One-off cleanup script — `scripts/clean-product-names.ts`

Run locally via `bun run scripts/clean-product-names.ts`. For each of the ~287 products it:

1. Sends the raw `name`, `brand`, `category`, `packaging` to the Lovable AI Gateway (Gemini 3 Flash, JSON mode) with a strict prompt:
   - Expand brand abbreviations (`F` → `Ferrero`, `T` → tray, `COLLEC` → Collection, `KSURP` → Kinder Surprise, etc.).
   - Title case, keep flavour/variant words.
   - Return `{ displayName, subtitle }` where `subtitle` is `"24×4 · 269g"` style (× not X, grams rounded sensibly, no SKU codes).
2. Falls back to a deterministic rule set (regex brand-prefix map + packaging string normaliser) if the AI call fails or returns malformed JSON.
3. Rewrites `src/data/products.ts` in place with the two new fields populated, preserving every other field exactly.

Batches ~10 products per request to keep token use low; caches results in a temp JSON so reruns are cheap.

### 3. UI render updates

Swap `{p.name}` for `{p.displayName}` with `{p.subtitle}` underneath in:

- `src/components/product-card.tsx` — name line + small muted subtitle
- `src/routes/product.$id.tsx` — H1 = displayName, subtitle below
- `src/routes/enquiry.tsx` — line items
- `src/components/app-shell.tsx` — search dropdown rows
- Any list/grid showing `p.name` (brand, category, search, promos, new arrivals on `index.tsx`)

### 4. Search keeps working

`searchProducts` in `src/lib/catalog.ts` already concatenates name + itemCode + barcode + brand + category. Add `displayName` to the haystack so users can search either the old SKU shorthand or the clean name.

## Out of scope

- No DB writes — products are static seed data.
- No retroactive edits to the AI image lookup table.
- No design changes beyond the new subtitle line.

## Acceptance

- Every product has a non-empty `displayName` with no all-caps shorthand and no weights jammed in.
- Subtitle shows pack × count and weight in grams/kg using `·` separator.
- Card, detail, enquiry, search, and home grids all show the two-line title.
- Searching `F COLLEC` still finds the Ferrero Collection product.
