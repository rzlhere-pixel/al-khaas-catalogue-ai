
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
              : "No image cached yet";

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
