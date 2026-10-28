import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, Play, SlidersHorizontal } from "lucide-react";
import { promotionalBannersQuery, videoCollectionsQuery } from "@/lib/site-content.queries";

export function HomePromotions() {
  const { data: banners = [] } = useQuery(promotionalBannersQuery);
  const { data: allCollections = [] } = useQuery(videoCollectionsQuery);
  const collections = allCollections.filter((item) => item.product_ids.length > 0);
  return (
    <div className="min-w-0 space-y-8">
      {banners.length > 0 && (
        <section aria-label="Destaques promocionais" className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-2 xl:grid-cols-3">
          {banners.map((banner) => (
            <Link key={banner.id}
              to={banner.category_id && banner.categories?.slug ? "/categoria/$slug" : "/ofertas"}
              params={banner.category_id && banner.categories?.slug ? { slug: banner.categories.slug } : true}
              search={banner.collection_id ? { colecao: banner.collection_id } : {}}
              className="group block w-[85%] shrink-0 overflow-hidden rounded-2xl border bg-card shadow-sm focus-visible:outline-2 focus-visible:outline-primary md:w-auto">
              <img src={banner.image_url} alt={banner.title} loading="lazy" decoding="async" className="aspect-[3/1] w-full object-cover" />
              <p className="flex min-h-11 items-center justify-between gap-3 px-4 py-3 text-sm font-bold group-hover:text-primary">{banner.title}<ArrowUpRight className="h-4 w-4 shrink-0" /></p>
            </Link>
          ))}
        </section>
      )}
      <nav aria-label="Encontre ofertas por preço" className="flex flex-wrap items-center gap-2 rounded-2xl border bg-card p-4">
        <span className="mr-2 flex items-center gap-2 text-sm font-bold"><SlidersHorizontal className="h-4 w-4 text-primary" />Escolha seu orçamento</span>
        {[30, 50, 100].map((price) => <Link key={price} to="/ofertas" search={{ max: price }} className="inline-flex min-h-11 items-center rounded-full border border-primary/20 bg-primary/5 px-4 text-sm font-semibold hover:bg-primary hover:text-primary-foreground">Até R$ {price}</Link>)}
        <Link to="/ofertas" search={{ ordem: "maior-desconto" }} className="inline-flex min-h-11 items-center rounded-full border border-primary/20 bg-primary/5 px-4 text-sm font-semibold hover:bg-primary hover:text-primary-foreground">Maiores descontos</Link>
      </nav>
      {collections.length > 0 && (
        <section className="space-y-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-primary">Viu no vídeo? Encontre aqui</p><h2 className="mt-1 text-xl font-extrabold md:text-2xl">Achadinhos dos vídeos</h2></div>
          <div className="grid min-w-0 grid-cols-[repeat(2,minmax(0,1fr))] gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {collections.map((item) => (
              <article key={item.id} className="min-w-0 overflow-hidden rounded-2xl border bg-card shadow-sm">
                <Link to="/ofertas" search={{ colecao: item.id }} className="block focus-visible:outline-2 focus-visible:outline-primary">
                  <img src={item.cover_url} alt={item.title} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-3"><h3 className="line-clamp-2 min-h-10 text-sm font-bold">{item.title}</h3><p className="mt-2 text-xs text-muted-foreground">{item.product_ids.length} produto{item.product_ids.length !== 1 ? "s" : ""} {item.product_ids.length !== 1 ? "disponíveis" : "disponível"}</p></div>
                </Link>
                <a href={item.video_url} target="_blank" rel="noopener noreferrer" className="mx-3 mb-3 flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary/10 px-2 text-sm font-semibold text-primary hover:bg-primary hover:text-primary-foreground"><Play className="h-4 w-4" />Assistir vídeo</a>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
