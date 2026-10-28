import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { productsByIdsQuery } from "@/lib/queries";
import { useFavorites } from "@/lib/visitor";
import { GridSkeleton, ProductGrid } from "@/components/site/ProductCard";

export const Route = createFileRoute("/_site/favoritos")({
  head: () => ({
    meta: [
      { title: "Meus favoritos — Achadinhos do Cal" },
      { name: "description", content: "Os achadinhos que você salvou neste navegador." },
      { property: "og:title", content: "Meus favoritos — Achadinhos do Cal" },
      { property: "og:description", content: "Os achadinhos que você salvou neste navegador." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Favoritos,
});

function Favoritos() {
  const { favs } = useFavorites();
  const { data, isLoading } = useQuery(productsByIdsQuery(favs));
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <h1 className="text-2xl font-extrabold md:text-3xl">Meus favoritos</h1>
      <p className="text-sm text-muted-foreground">Seus favoritos ficam salvos apenas neste navegador, sem precisar de cadastro.</p>
      {isLoading ? (
        <GridSkeleton />
      ) : data?.length ? (
        <ProductGrid products={data} />
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-primary" />
          <p className="mt-3 font-semibold">Você ainda não salvou nenhum achadinho.</p>
          <Link to="/ofertas" className="mt-4 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Explorar ofertas</Link>
        </div>
      )}
    </div>
  );
}
