import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { ProductImage, useProductImage } from "@/components/product-image";
import { ContactPicker } from "@/components/contact-picker";
import {
  alternatives,
  formatPrice,
  getProduct,
  relatedProducts,
} from "@/lib/catalog";
import { useEnquiry, useHydrated } from "@/lib/enquiry-store";
import { buildEnquiryMessage } from "@/lib/contacts";
import { lookupProductImage } from "@/lib/product-images.functions";
import { ChevronLeft, Minus, Plus, ShoppingBag, Check, Sparkles, Wand2, Loader2, AlertCircle } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/data/products";

export const Route = createFileRoute("/product/$id")({
  head: ({ params }) => {
    const product = getProduct(params.id);
    return {
      meta: [
        { title: product ? `${product.displayName} — Al Khaas Catalogue` : "Product — Al Khaas" },
        {
          name: "description",
          content: product
            ? `${product.displayName} by ${product.brand}. Browse details, pricing & send WhatsApp enquiry to Al Khaas General Trading.`
            : "Product not found",
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const p = getProduct(params.id);
    if (!p) {
      console.warn(`Product not found with ID: ${params.id}`);
      throw notFound();
    }
    return { product: p };
  },
  preloadStaleTime: 0,
  component: ProductPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl text-foreground">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">The product you're looking for doesn't exist in our catalogue.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link to="/" className="inline-block text-sm text-gold hover:text-gold/80">
            ← Back to catalogue
          </Link>
          <Link to="/categories" className="inline-block text-sm text-gold hover:text-gold/80">
            Browse categories →
          </Link>
        </div>
      </div>
    </AppShell>
  ),
});

function ProductPage() {
  const { product } = Route.useLoaderData();
  const [qty, setQty] = useState(1);
  const [picker, setPicker] = useState(false);
  const enquiry = useEnquiry();
  const hydrated = useHydrated();
  const inEnquiry = hydrated && enquiry.has(product.id);
  const related = relatedProducts(product, 8);
  const { premium, budget } = alternatives(product, 4);

  if (!product) {
    return (
      <AppShell>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm text-muted-foreground">Loading product details...</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-7xl px-6 pt-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="h-4 w-4" /> Back to catalogue
        </Link>
      </div>
      <section className="mx-auto max-w-7xl px-6 py-8 sm:py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <ProductImage productId={product.id} name={product.displayName} brand={product.brand} className="aspect-square w-full" rounded="rounded-3xl" />
            <AiImageLookup product={product} />
          </div>
          <div>
            <Link to="/brand/$brand" params={{ brand: product.brand }} className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
              {product.brand}
            </Link>
            <h1 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">{product.displayName}</h1>
            {product.subtitle && <div className="mt-1 text-sm text-muted-foreground">{product.subtitle}</div>}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {product.itemCode && <span className="brand-chip">Code · {product.itemCode}</span>}
              {product.barcode && <span className="brand-chip">Barcode · {product.barcode}</span>}
              <Link to="/category/$cat" params={{ cat: product.category }} className="brand-chip hover:bg-accent">
                {product.category}
              </Link>
              {product.packaging && <span className="brand-chip">{product.packaging}</span>}
              {product.is_promo && (
                <span className="brand-chip bg-gold/20 text-gold-foreground border-gold/40">🏷 Promotional Pack</span>
              )}
            </div>

            <div className="gold-divider my-6" />

            {/* Pricing disclaimer ABOVE the add button */}
            <div className="mb-5 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              <span>
                <strong>Pricing is indicative.</strong> Confirm availability and final price with your Al Khaas sales contact before placing an order.
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <PriceTile label="Case price" value={product.casePrice} highlight />
              {product.outerPrice != null && <PriceTile label="Outer price" value={product.outerPrice} />}
              {product.piecePrice != null && <PriceTile label="Piece price" value={product.piecePrice} />}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-full border border-border bg-card shadow-soft">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="p-3 text-muted-foreground hover:text-foreground" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 text-center text-sm font-medium">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)} className="p-3 text-muted-foreground hover:text-foreground" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  enquiry.add(product.id, qty);
                  setQty(1);
                }}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-soft ${
                  inEnquiry ? "bg-secondary text-foreground" : "bg-cocoa text-cream hover:opacity-95"
                }`}
              >
                {inEnquiry ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
                {inEnquiry ? "Added to enquiry" : "Add to enquiry"}
              </button>
              <button
                onClick={() => setPicker(true)}
                className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-semibold text-whatsapp-foreground shadow-soft hover:brightness-105"
              >
                Send WhatsApp enquiry
              </button>
            </div>

            {/* Stock badge */}
            <div className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />
              Check availability with sales team
            </div>
          </div>
        </div>
      </section>

      {(premium.length > 0 || budget.length > 0) && (
        <section className="border-y border-border bg-secondary/40">
          <div className="mx-auto max-w-7xl px-6 py-12">
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> Smart alternatives
            </div>
            <h2 className="mt-2 font-display text-3xl text-foreground">You might also consider</h2>
            <div className="mt-6 grid gap-8 lg:grid-cols-2">
              <AlternativeColumn title="Premium picks" items={premium} />
              <AlternativeColumn title="Budget-friendly" items={budget} />
            </div>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Related</div>
          <h2 className="mt-2 font-display text-3xl text-foreground">More from this range</h2>
          <div className="gold-divider mt-3 w-16" />
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      <ContactPicker
        open={picker}
        onClose={() => setPicker(false)}
        message={buildEnquiryMessage([{ name: product.displayName, brand: product.brand, itemCode: product.itemCode, weight: product.subtitle, qty }])}
      />
    </AppShell>
  );
}

function PriceTile({ label, value, highlight = false }: { label: string; value: number | null; highlight?: boolean }) {
  if (value == null) return null;
  return (
    <div
      className={`rounded-2xl border p-4 ${
        highlight ? "border-gold/40 bg-gold/10" : "border-border bg-card"
      }`}
    >
      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl text-foreground">{formatPrice(value)}</div>
    </div>
  );
}

function AlternativeColumn({ title, items }: { title: string; items: Product[] }) {
  if (items.length === 0)
    return (
      <div>
        <div className="font-display text-lg text-foreground">{title}</div>
        <div className="mt-3 text-sm text-muted-foreground">No alternatives in this price range.</div>
      </div>
    );
  return (
    <div>
      <div className="font-display text-lg text-foreground">{title}</div>
      <ul className="mt-4 space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <Link
              to="/product/$id"
              params={{ id: p.id }}
              className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-soft hover:bg-secondary"
            >
              <ProductImage productId={p.id} name={p.displayName} brand={p.brand} className="h-14 w-14 shrink-0" rounded="rounded-xl" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[11px] uppercase tracking-wider text-muted-foreground">{p.brand}</div>
                <div className="line-clamp-1 text-sm text-foreground">{p.displayName}</div>
              </div>
              <div className="text-sm font-medium text-foreground">{formatPrice(p.casePrice ?? p.piecePrice)}</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AiImageLookup({ product }: { product: Product }) {
  const { data } = useProductImage(product.id);
  const qc = useQueryClient();
  const lookup = useServerFn(lookupProductImage);
  const mutation = useMutation({
    mutationFn: () =>
      lookup({
        data: {
          productId: product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          packaging: product.packaging,
        },
      }),
    onSuccess: (row) => {
      qc.setQueryData(["product-image", product.id], {
        image_url: row.image_url,
        confidence: row.confidence,
        status: row.status,
      });
    },
    onError: (error) => {
      console.error("Image lookup failed:", error);
    },
  });

  const status = data?.status;
  const pct = data ? Math.round(data.confidence * 100) : null;
  const label =
    status === "found"
      ? `AI match · ${pct}% confidence`
      : status === "low_confidence"
        ? `Low confidence (${pct}%) · placeholder shown`
        : status === "invalid_url"
          ? "AI suggestion didn't resolve · placeholder shown"
          : status === "error"
            ? "Lookup failed · placeholder shown"
            : status === "searching"
              ? "Searching…"
              : "Image coming soon";

  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-border bg-card/60 px-3 py-2 text-xs">
      <span className="text-muted-foreground">{label}</span>
      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
        className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background disabled:opacity-60"
      >
        {mutation.isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Wand2 className="h-3.5 w-3.5" />
        )}
        {data?.image_url ? "Re-run AI lookup" : "Find image with AI"}
      </button>
    </div>
  );
}
