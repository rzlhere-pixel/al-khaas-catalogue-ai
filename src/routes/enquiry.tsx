import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProductImage } from "@/components/product-image";
import { ContactPicker } from "@/components/contact-picker";
import { formatPrice, getProduct } from "@/lib/catalog";
import { useEnquiry, useHydrated } from "@/lib/enquiry-store";
import { buildEnquiryMessage } from "@/lib/contacts";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/enquiry")({
  head: () => ({
    meta: [
      { title: "My enquiry — Al Khaas Catalogue" },
      { name: "description", content: "Review your selected products and send a WhatsApp enquiry to Al Khaas." },
    ],
  }),
  component: EnquiryPage,
});

function EnquiryPage() {
  const enquiry = useEnquiry();
  const hydrated = useHydrated();
  const [picker, setPicker] = useState(false);

  const items = (hydrated ? enquiry.lines : []).map((l) => ({ line: l, p: getProduct(l.id) })).filter((r) => !!r.p) as {
    line: { id: string; qty: number };
    p: NonNullable<ReturnType<typeof getProduct>>;
  }[];

  const totalUnits = items.reduce((s, r) => s + r.line.qty, 0);
  const indicativeTotal = items.reduce((s, r) => s + (r.p.casePrice ?? r.p.piecePrice ?? 0) * r.line.qty, 0);

  const msg = buildEnquiryMessage(
    items.map((r) => ({ name: r.p.name, itemCode: r.p.itemCode, qty: r.line.qty })),
  );

  return (
    <AppShell>
      <section className="mx-auto max-w-5xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Your selection</div>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">My enquiry</h1>
        <div className="gold-divider mt-3 w-16" />

        {hydrated && items.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-border bg-card p-10 text-center shadow-soft">
            <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary">
              <ShoppingBag className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="mt-4 font-display text-xl text-foreground">Your enquiry is empty</div>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Browse the catalogue, add the items you're interested in, and send everything in one
              WhatsApp message.
            </p>
            <Link to="/" className="mt-6 inline-flex rounded-full bg-cocoa px-5 py-3 text-sm font-medium text-cream">
              Browse products
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 space-y-3">
              {items.map(({ line, p }) => (
                <div key={p.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-soft sm:gap-4 sm:p-4">
                  <Link to="/product/$id" params={{ id: p.id }}>
                    <ProductImage name={p.name} brand={p.brand} className="h-16 w-16 sm:h-20 sm:w-20 shrink-0" rounded="rounded-xl" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link to="/product/$id" params={{ id: p.id }}>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{p.brand}</div>
                      <div className="line-clamp-2 text-sm font-medium text-foreground sm:text-base">{p.name}</div>
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {p.itemCode || "—"} · {formatPrice(p.casePrice ?? p.piecePrice)}
                    </div>
                  </div>
                  <div className="inline-flex items-center rounded-full border border-border bg-background">
                    <button onClick={() => enquiry.setQty(p.id, line.qty - 1)} className="p-2 text-muted-foreground hover:text-foreground"><Minus className="h-4 w-4" /></button>
                    <span className="min-w-8 text-center text-sm font-medium">{line.qty}</span>
                    <button onClick={() => enquiry.setQty(p.id, line.qty + 1)} className="p-2 text-muted-foreground hover:text-foreground"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => enquiry.remove(p.id)} className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-destructive" aria-label="Remove">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-soft">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                    {items.length} products · {totalUnits} units
                  </div>
                  <div className="mt-1 font-display text-3xl text-foreground">
                    ~ {formatPrice(indicativeTotal)}
                  </div>
                  <div className="text-xs text-muted-foreground">Indicative total · confirmed by sales</div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => enquiry.clear()} className="rounded-full border border-border px-4 py-2.5 text-sm text-muted-foreground hover:bg-secondary">
                    Clear all
                  </button>
                  <button
                    onClick={() => setPicker(true)}
                    className="inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-3 text-sm font-semibold text-whatsapp-foreground shadow-soft hover:brightness-105"
                  >
                    Send WhatsApp enquiry
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <ContactPicker open={picker} onClose={() => setPicker(false)} message={msg} />
    </AppShell>
  );
}
