// Build-time map of itemCode -> CDN image URL for product photos
// extracted from the Product Slab Report XLSX.
const modules = import.meta.glob<{ default: { url: string } }>(
  "@/assets/products/*.png.asset.json",
  { eager: true, import: "default" },
);

export const productImageMap: Record<string, string> = {};
for (const [path, mod] of Object.entries(modules)) {
  const match = path.match(/\/([^/]+)\.png\.asset\.json$/);
  if (match && mod?.url) productImageMap[match[1]] = mod.url;
}

export function getProductImage(itemCode?: string): string | undefined {
  if (!itemCode) return undefined;
  return productImageMap[itemCode];
}
