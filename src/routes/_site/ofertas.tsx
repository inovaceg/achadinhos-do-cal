import { createFileRoute } from "@tanstack/react-router";
import { ProductBrowser, parseSearch } from "@/components/site/ProductBrowser";

export const Route = createFileRoute("/_site/ofertas")({
  validateSearch: parseSearch,
  head: () => ({
    meta: [
      { title: "Todas as ofertas — Achadinhos do Cal" },
      { name: "description", content: "Busque e filtre todos os achadinhos por loja, categoria, preço e desconto." },
      { property: "og:title", content: "Todas as ofertas — Achadinhos do Cal" },
      { property: "og:description", content: "Busque e filtre todos os achadinhos por loja, categoria, preço e desconto." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Ofertas,
});

function Ofertas() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <h1 className="text-2xl font-extrabold md:text-3xl">
        {search.q ? <>Resultados para “{search.q}”</> : "Todas as ofertas"}
      </h1>
      <ProductBrowser params={search} onChange={(p) => navigate({ search: p, replace: true })} />
    </div>
  );
}
