import { useQuery } from "@tanstack/react-query";
import { brandPalette } from "@/lib/catalog";
import { supabase } from "@/integrations/supabase/client";
import { getProductImage } from "@/lib/product-asset-map";
import { useState } from "react";

interface Props {
  name: string;
  brand: string;
  productId?: string;
  className?: string;
  rounded?: string;
  /** Minimum confidence (0-1) required to show the real image. Default 0.7. */
  threshold?: number;
}

type Row = {
  image_url: string | null;
  confidence: number;
  status: string;
};

export function useProductImage(productId?: string) {
  return useQuery({
    enabled: !!productId,
    queryKey: ["product-image", productId],
    queryFn: async (): Promise<Row | null> => {
      const { data, error } = await supabase
        .from("product_images")
        .select("image_url, confidence, status")
        .eq("product_id", productId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Renders a polished branded "product tile" SVG when a real image is absent
// or the AI lookup confidence is below the threshold.
export function ProductImage({
  name,
  brand,
  productId,
  className = "aspect-square w-full",
  rounded = "rounded-2xl",
  threshold = 0.7,
}: Props) {
  const embedded = getProductImage(productId);
  const { data } = useProductImage(embedded ? undefined : productId);
  const [imgFailed, setImgFailed] = useState(false);
  const realUrl = embedded
    ?? (data?.image_url && data.confidence >= threshold && data.status === "found" ? data.image_url : null);
  const showReal = !!realUrl && !imgFailed;

  return (
    <div className={`${className} ${rounded} relative overflow-hidden bg-secondary/40`}>
      <Placeholder name={name} brand={brand} />
      {showReal && (
        <img
          src={realUrl!}
          alt={name}
          loading="lazy"
          onError={() => setImgFailed(true)}
          className="absolute inset-0 h-full w-full object-contain p-2"
        />
      )}
    </div>
  );
}

function Placeholder({ name, brand }: { name: string; brand: string }) {
  const p = brandPalette(brand);
  const initials = brand
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
  const variant = name.length % 3;
  return (
    <>
      <svg
        viewBox="0 0 400 400"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`g-${brand}-${variant}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={p.from} />
            <stop offset="100%" stopColor={p.to} />
          </linearGradient>
          <radialGradient id={`r-${brand}-${variant}`} cx="0.3" cy="0.25" r="0.9">
            <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        <rect width="400" height="400" fill={`url(#g-${brand}-${variant})`} />
        <rect width="400" height="400" fill={`url(#r-${brand}-${variant})`} />
        {variant === 0 && (
          <>
            <circle cx="300" cy="320" r="70" fill="rgba(255,255,255,0.06)" />
            <circle cx="80" cy="90" r="40" fill="rgba(255,255,255,0.08)" />
          </>
        )}
        {variant === 1 && (
          <>
            <rect x="40" y="260" width="320" height="14" rx="7" fill="rgba(255,255,255,0.08)" />
            <rect x="40" y="290" width="220" height="10" rx="5" fill="rgba(255,255,255,0.05)" />
          </>
        )}
        {variant === 2 && (
          <>
            <path d="M0 280 Q 200 220 400 290 L 400 400 L 0 400 Z" fill="rgba(0,0,0,0.18)" />
            <circle cx="340" cy="80" r="28" fill="rgba(255,255,255,0.10)" />
          </>
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <div
          className="font-display text-3xl tracking-tight sm:text-4xl"
          style={{ color: p.ink, textShadow: "0 1px 12px rgba(0,0,0,0.25)" }}
        >
          {brand}
        </div>
        <div
          className="mt-1 text-[10px] uppercase tracking-[0.3em]"
          style={{ color: p.ink, opacity: 0.7 }}
        >
          {initials}
        </div>
      </div>
    </>
  );
}
