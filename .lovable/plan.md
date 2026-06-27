## Changes

**1. Footer (`src/components/app-shell.tsx`)**
- Replace description with: "Trusted FMCG distributor in the UAE — premium confectionery via wholesale, retail & B2B e-commerce."
- Replace address block with: GAL Business Center, Galadari Building 16, 1st Floor, Office #14, Dubai Production City (IMPZ), Dubai, UAE.
- Add social links row (Instagram, Facebook, LinkedIn) using lucide icons, opening in new tabs with `rel="noopener noreferrer"`.

**2. Remove Accessories category (`src/data/products.ts`)**
- Delete the 2 products whose `category === "Accessories"`. Category list auto-derives from products, so it disappears from filters, nav, and category routes.

**3. Best Sellers logic (`src/lib/catalog.ts`)**
- Update `bestSellers()` brand order to: Ferrero Rocher, Kinder, Mars, Cadbury, Nestle.
- Cap at 2 products per brand, preserving order → up to 10 cards.

**4. Outer price row (`src/routes/product.$id.tsx`)**
- Conditionally render the Outer price row only when `outerPrice != null`. No dash placeholder.

**5. Pricing disclaimer (`src/routes/product.$id.tsx`)**
- Move the existing "prices indicative / confirmed by sales" line into an amber info box (`bg-amber-50 border border-amber-200 text-amber-900` with an Info icon) placed directly above the "Add to Enquiry" button.

## Out of scope
No data model, routing, or backend changes. Pure UI/data edits.
