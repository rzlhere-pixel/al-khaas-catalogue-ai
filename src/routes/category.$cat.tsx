import { createFileRoute, notFound } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { ProductCard } from "@/components/product-card";
import { ALL_CATEGORIES, productsByCategory } from "@/lib/catalog";

export const Route = createFileRoute("/category/$cat")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.cat} — Al Khaas Catalogue` },
      { name: "description", content: `Browse ${params.cat} from Al Khaas General Trading.` },
    ],
  }),
  loader: ({ params }) => {
    if (!ALL_CATEGORIES.includes(params.cat)) throw notFound();
    return { cat: params.cat };
  },
  component: CategoryPage,
  notFoundComponent: () => (
    <AppShell>
      <div className="mx-auto max-w-3xl px-6 py-20 text-center">
        <h1 className="font-display text-3xl">Category not found</h1>
      </div>
    </AppShell>
  ),
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const products = productsByCategory(cat);
  return (
    <AppShell>
      <section className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Category</div>
        <h1 className="mt-2 font-display text-4xl text-foreground sm:text-5xl">{cat}</h1>
        <div className="gold-divider mt-3 w-16" />
        <div className="mt-3 text-sm text-muted-foreground">{products.length} products</div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>
    </AppShell>
  );
}
