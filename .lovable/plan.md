
# UX Enhancement Plan

Additive changes only. No refactor of existing branding, layout, or components.

## 1. Data cleanup (foundation for everything else)

**Display name consistency**
- `product.$id.tsx` page title currently renders raw `name` (e.g. `F COLLEC T24X4 - 269.4 Gr`) while cards use `displayName`. Switch PDP title (and breadcrumbs/document title) to `displayName`, keep `subtitle` under it, and preserve raw `name` only as a small "ERP code" line for sales reference.

**Category re-mapping**
- Split the ~202-item "Chocolates" bucket into: `Chocolate Bars`, `Boxed & Praline Chocolates`, `Chocolate Spreads`, `Wafers`, `Seasonal & Gift Chocolate`.
- Reassign "Other" items to their real category; move non-product items (barcode printer, POS accessories) to `Accessories` (already hidden from public lists).
- Approach: run a one-shot classifier script (`/tmp/reclassify.py`) using Gemini via the Lovable AI Gateway over each product's `displayName + subtitle + packaging + brand`. Persist results by rewriting the `category` field inside `src/data/products.ts`. Wafers already exists; keep spreads (Nutella etc.) in `Spreads` unless the request forces "Chocolate Spreads" as a chocolate subcategory — plan is: keep hazelnut spreads in `Spreads`, add chocolate-specific subcats only.
- Update `CATEGORY_DESCRIPTION` and `CATEGORY_ICON` maps in `src/routes/categories.tsx` for the new categories.

## 2. Global sticky search

- Add a `<GlobalSearch />` component embedded in the existing `AppShell` header. Sticky on scroll (already sticky header — mount the input inside it, collapsing on mobile to an icon that expands).
- Instant results: reuse `searchProducts()` with a debounced (~120ms) dropdown showing top 8 matches (image, displayName, brand, SKU). Enter or "See all results" navigates to `/search?q=...`.
- Ensure `searchProducts` index already covers displayName, name, itemCode, barcode, brand, category. Extend with `subtitle` (weight) and add naive fuzzy tolerance by stripping punctuation & collapsing whitespace on both haystack and query.

## 3. Filter chips on category & brand pages

- New `<FilterChips />` client component on `category.$cat.tsx` and `brand.$brand.tsx`.
- Chips: Brand (on category pages), Package Type (from `packaging` heuristics: Tray / Box / Pouch / Bar), Weight buckets (<50g, 50–150g, 150–300g, 300g+), New Arrivals, Best Sellers, Promotions.
- Country of Origin & Availability: skip in this pass (data not present) — will note in closing message.
- State stored in URL search params via `validateSearch` so filters are shareable.

## 4. Category cards

- After #1, counts already come from `productsByCategory(cat).length`. Add icons for the new subcategories in `CATEGORY_ICON`. No layout change.

## 5. Product images

- Audit only in this pass: add a small server function that returns { itemCode, hasEmbedded, hasVerifiedAi } — surfaced inside existing `/admin/images` dashboard as a "Missing images" filter (already partially exists). Backfill runs via existing bulk lookup (already implemented).
- Full-screen preview + pinch-zoom: add a lightweight modal on PDP image tap using existing image; use CSS `touch-action: pinch-zoom` inside an overlay. No new deps.

## 6. Enquiry flow QA

- Inspect `src/lib/enquiry-store.ts` + WhatsApp message builder to confirm template includes `displayName`, `brand`, `itemCode` (SKU), `subtitle` (weight). Fix template if any field missing. No UX redesign.

## 7. Product detail additive fields

- Extend `Product` interface with optional: `ingredients?`, `nutrition?`, `origin?`, `storage?`, `shelfLife?`, `cartonQty?`.
- Render an "Additional information" accordion below the enquiry CTA only when at least one field is populated. Data population deferred — fields will render blank until sales team fills them (or future AI enrichment pass). No layout impact when empty.

## Execution order

1. Reclassify categories + update PDP title (single migration of `products.ts`).
2. Global sticky search dropdown.
3. Filter chips.
4. Category icons/counts polish.
5. Image audit filter + zoom modal.
6. Enquiry template QA.
7. PDP additive fields scaffold.

## Explicit non-goals

- No visual redesign, no color/font changes, no e-commerce/cart features.
- No changes to admin auth, routing shell, or Supabase schema (product enrichment lives in the static `products.ts`).
- Country of Origin & Availability filters skipped (data unavailable) — will call out in reply.
