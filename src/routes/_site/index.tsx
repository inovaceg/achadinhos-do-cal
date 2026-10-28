import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame, Eye, MousePointerClick, Trophy, Sparkles, ThumbsUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BannerCarousel } from "@/components/site/BannerCarousel";
import { ProductGrid, GridSkeleton } from "@/components/site/ProductCard";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { bannersQuery, categoriesQuery, homeSectionQuery, type HomeSection } from "@/lib/queries";

export const Route = createFileRoute("/_site/")({
  head: () => ({
    meta: [
      { title: "Achadinhos do Cal — Achou, gostou, economizou!" },
      { name: "description", content: "Achadinhos e promoções selecionados da Shopee, Mercado Livre, Amazon e Magalu. Achou, gostou, economizou!" },
      { property: "og:title", content: "Achadinhos do Cal — Achou, gostou, economizou!" },
      { property: "og:description", content: "Achadinhos e promoções selecionados da Shopee, Mercado Livre, Amazon e Magalu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Section({ id, title, icon: Icon, hideEmpty = true }: { id: HomeSection; title: string; icon: LucideIcon; hideEmpty?: boolean }) {
  const { data, isLoading } = useQuery(homeSectionQuery(id));
  if (!isLoading && hideEmpty && !data?.length) return null;
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <h2 className="flex items-center gap-2 text-xl font-extrabold md:text-2xl">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary"><Icon className="h-5 w-5" /></span>
          {title}
        </h2>
        <Link to="/ofertas" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline">
          Ver todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      {isLoading ? <GridSkeleton /> : <ProductGrid products={data ?? []} />}
    </section>
  );
}

function Home() {
  const { data: banners = [] } = useQuery(bannersQuery);
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { data: newest, isLoading } = useQuery(homeSectionQuery("new"));

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-5 md:py-8">
      <BannerCarousel banners={banners} />

      <Section id="deals" title="Ofertas imperdíveis" icon={Flame} />
      <Section id="recommended" title="Achadinhos do Cal recomenda" icon={ThumbsUp} />
      <Section id="viewed" title="Mais procurados" icon={Eye} />
      <Section id="clicked" title="Mais clicados" icon={MousePointerClick} />
      <Section id="bestsellers" title="Mais vendidos" icon={Trophy} />
      <Section id="new" title="Novidades" icon={Sparkles} />

      {!isLoading && !newest?.length && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-display text-xl font-bold">Os primeiros achadinhos estão chegando!</p>
          <p className="mt-2 text-sm text-muted-foreground">Volte em breve para conferir as melhores ofertas.</p>
        </div>
      )}

      {cats.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-xl font-extrabold md:text-2xl">Ofertas por categoria</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {cats.map((c) => (
              <Link
                key={c.id}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="group flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-card transition hover:-translate-y-0.5 hover:border-primary"
              >
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <CategoryIcon name={c.icon} className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold sm:text-sm">{c.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
