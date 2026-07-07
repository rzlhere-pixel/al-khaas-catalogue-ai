// Build-time map of itemCode -> local image URL for product photos.
// Prefer the copied local files from the replacement folder and fall back to
// the generated Lovable metadata URLs if a local asset is unavailable.
const imageModules = import.meta.glob("@/assets/products/*.{png,jpg,jpeg}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const metadataModules = import.meta.glob<{ url: string }>(
  "@/assets/products/*.png.asset.json",
  { eager: true, import: "default" },
);

export const productImageMap: Record<string, string> = {};
for (const [path, url] of Object.entries(imageModules)) {
  const match = path.match(/\/([^/]+)\.(png|jpg|jpeg)$/);
  if (match?.[1] && url) productImageMap[match[1]] = url;
}

for (const [path, mod] of Object.entries(metadataModules)) {
  const match = path.match(/\/([^/]+)\.png\.asset\.json$/);
  if (match?.[1] && mod?.url && !productImageMap[match[1]]) productImageMap[match[1]] = mod.url;
}

export function getProductImage(itemCode?: string): string | undefined {
  if (!itemCode) return undefined;
  return productImageMap[itemCode];
}
