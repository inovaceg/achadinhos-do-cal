import { createFileRoute, notFound } from "@tanstack/react-router";
import { ProductBrowser, parseSearch } from "@/components/site/ProductBrowser";
import { getCategoryMeta } from "@/lib/public.functions";
import { siteUrl } from "@/lib/seo";

export const Route = createFileRoute("/_site/categoria/$slug")({
  validateSearch: parseSearch,
  loader: async ({ params }) => {
    const cat = await getCategoryMeta({ data: { slug: params.slug } });
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => {
    const name = loaderData?.cat.name ?? "Categoria";
    const canonical = siteUrl(`/categoria/${encodeURIComponent(loaderData?.cat.slug ?? "")}`);
    const desc = loaderData?.cat.description || `Os melhores achadinhos de ${name} selecionados pelo Achadinhos do Cal.`;
    return {
      meta: [
        { title: `${name} — Achadinhos do Cal` },
        { name: "description", content: desc },
        { property: "og:title", content: `${name} — Achadinhos do Cal` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  notFoundComponent: () => <div className="mx-auto max-w-7xl px-4 py-20 text-center">Categoria não encontrada.</div>,
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <div>
        <h1 className="text-2xl font-extrabold md:text-3xl">{cat.name}</h1>
        {cat.description && <p className="mt-1 text-muted-foreground">{cat.description}</p>}
      </div>
      <ProductBrowser
        lockCategory
        params={{ ...search, categoria: cat.slug }}
        onChange={(p) => navigate({ search: { ...p, categoria: undefined }, replace: true })}
      />
    </div>
  );
}
