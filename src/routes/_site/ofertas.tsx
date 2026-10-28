import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
  const { data: collection } = useQuery({ queryKey: ["video-collection", search.colecao], enabled: !!search.colecao, queryFn: async () => { const { data, error } = await supabase.from("video_collections").select("id,title,cover_url,video_url").eq("id", search.colecao!).eq("active", true).maybeSingle(); if (error) throw error; return data; } });
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      {collection && <section className="flex items-center gap-4 rounded-2xl border bg-card p-4"><img src={collection.cover_url} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" /><div className="min-w-0"><p className="text-xs font-bold uppercase text-primary">Achadinhos dos vídeos</p><h2 className="text-lg font-bold">{collection.title}</h2><a href={collection.video_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-semibold text-primary">Assistir ao vídeo</a></div></section>}
      <h1 className="text-2xl font-extrabold md:text-3xl">
        {search.q ? <>Resultados para “{search.q}”</> : "Todas as ofertas"}
      </h1>
      <ProductBrowser params={search} onChange={(p) => navigate({ search: p, replace: true })} />
    </div>
  );
}
