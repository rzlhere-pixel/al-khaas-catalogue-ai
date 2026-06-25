
## Goal

Keep Al Khaas as the company identity (name + logo) but adopt the visual system from the 3SixtyDeals e-com brand book (colors, typography, white backgrounds). The current "chocolate/gold confectionery-luxe" look gets retired.

## What changes

### 1. Logo
- Upload the Al Khaas mark (extracted from `AL KHASS FINAL- PDF.pdf`) as a CDN asset and import it.
- Replace the circular "AK" monogram in the header (`src/components/app-shell.tsx`) and footer with the real logo image (lockup with "Al Khaas General Trading" text where space allows; mark-only on small screens).
- Use the same image for the favicon and OG image in `src/routes/__root.tsx`.

### 2. Brand color system (`src/styles.css`)
Pulled directly from the brand book:

```text
Primary    Orange   #fe7e34   (was: gold)
Primary    Maroon   #99135f   (was: cocoa accents)
Primary    Purple   #71239e   (accent)
Secondary  Cobalt   #114759   (deep ink / footer)
Secondary  Sky      #6693bc
Secondary  Violet   #8867b7
Surface    White    #ffffff   (was: cream)
```

Strategy: keep the existing token names (`--cocoa`, `--gold`, `--cream`) but remap their values so the new palette flows everywhere without rewriting every component:
- `--cream` → white
- `--cocoa` → cobalt `#114759` (used for dark hero/footer surfaces — still readable with white text)
- `--gold` → orange `#fe7e34` (primary CTA color, accents, dividers)
- Add new tokens `--brand-maroon`, `--brand-purple` for hero gradients and section highlights.
- Background goes from warm cream to clean white; foreground to near-black.
- Re-tune `--primary`, `--accent`, `--ring`, `--shadow-gold` to match.

### 3. Typography
- Swap Fraunces (display serif) and Inter for **Montserrat** (the brand book's web fallback for Proxima Nova) across both `--font-display` and `--font-sans`, with different weights for headings (700/800) vs body (400/500).
- Update the Google Fonts `<link>` in `__root.tsx`.

### 4. Hero & key surfaces
- Replace the brown chocolate gradient on the hero with a brand gradient (cobalt → maroon → orange glow) layered over the existing hero image. Tagline pill switches from gold-on-cocoa to orange-on-cobalt.
- "Promotional packs" and "Trade & retail" panels move from cocoa-brown to cobalt with orange accents.
- Brand chips and "gold-divider" become orange.

### 5. Meta
- Update `theme-color` meta and any hardcoded brand hex in `__root.tsx` to the new palette.

## Files touched

- `src/styles.css` — full token remap + font stack
- `src/routes/__root.tsx` — fonts link, favicon, theme-color
- `src/components/app-shell.tsx` — logo image in header & footer
- `src/routes/index.tsx` — hero gradient adjustments only where the brown tone needs to read as cobalt/maroon
- `src/assets/alkhaas-logo.png.asset.json` — new CDN pointer

No data, routing, server-function, or business-logic changes. The WhatsApp enquiry flow, product data, AI image lookup, and all routes stay exactly as they are.

## Out of scope (ask if you want these next)
- Reworking product card layouts to a denser e-com grid like 3sixtydeals.com
- Arabic/RTL typography
- Adding the 3SixtyDeals "palm-tree" pattern as a decorative motif
