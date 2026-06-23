import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { ALL_BRANDS, ALL_CATEGORIES } from "@/lib/catalog";
import { PRODUCTS } from "@/data/products";

const BASE_URL = "";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const paths: string[] = ["/", "/categories", "/brands", "/visit", "/enquiry", "/search"];
        for (const c of ALL_CATEGORIES) paths.push(`/category/${encodeURIComponent(c)}`);
        for (const b of ALL_BRANDS) paths.push(`/brand/${encodeURIComponent(b)}`);
        for (const p of PRODUCTS) paths.push(`/product/${encodeURIComponent(p.id)}`);

        const urls = paths
          .map(
            (path) =>
              `  <url>\n    <loc>${BASE_URL}${path}</loc>\n    <changefreq>weekly</changefreq>\n  </url>`,
          )
          .join("\n");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
        return new Response(xml, {
          headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" },
        });
      },
    },
  },
});
