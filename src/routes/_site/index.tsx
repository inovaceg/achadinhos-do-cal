import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Flame, Eye, MousePointerClick, Trophy, Sparkles, ThumbsUp, BadgeCheck, Truck, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BannerCarousel } from "@/components/site/BannerCarousel";
import { ProductGrid, GridSkeleton } from "@/components/site/ProductCard";
import { CategoryIcon } from "@/components/site/CategoryIcon";
import { CategoryCount } from "@/components/site/CategoryCount";
import { bannersQuery, categoriesQuery, homeSectionQuery, type HomeSection } from "@/lib/queries";
import { HomePromotions } from "@/components/site/HomePromotions";

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

function SectionHeader({ title, subtitle, icon: Icon, link = true }: { title: string; subtitle?: string; icon?: LucideIcon; link?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <Icon className="h-5 w-5" />
          </span>
        )}
        <div>
          <h2 className="text-xl font-extrabold tracking-tight md:text-2xl">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
      {link && (
        <Link to="/ofertas" className="group flex min-h-11 shrink-0 items-center gap-1 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary">
          Ver todas <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

function Section({ id, title, subtitle, icon, highlight }: { id: HomeSection; title: string; subtitle: string; icon: LucideIcon; highlight?: boolean }) {
  const { data, isLoading } = useQuery(homeSectionQuery(id));
  if (!isLoading && !data?.length) return null;
  return (
    <section className={`space-y-5 ${highlight ? "rounded-3xl bg-accent/60 p-4 md:p-6" : ""}`}>
      <SectionHeader title={title} subtitle={subtitle} icon={icon} />
      {isLoading ? <GridSkeleton /> : <ProductGrid products={data ?? []} />}
    </section>
  );
}

const perks = [
  { icon: BadgeCheck, title: "Curadoria diária", text: "Só ofertas que valem a pena" },
  { icon: ShieldCheck, title: "Lojas confiáveis", text: "Shopee, Mercado Livre, Amazon e Magalu" },
  { icon: Truck, title: "Compra direta", text: "Você finaliza no site da loja" },
];

function Home() {
  const { data: banners = [] } = useQuery(bannersQuery);
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { data: newest, isLoading } = useQuery(homeSectionQuery("new"));

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-4 py-5 md:space-y-16 md:py-8">
      <div className="space-y-4">
        <BannerCarousel banners={banners} />
        <ul className="grid gap-3 sm:grid-cols-3">
          {perks.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-card">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary"><Icon className="h-5 w-5" /></span>
              <div className="min-w-0">
                <p className="text-sm font-bold">{title}</p>
                <p className="truncate text-xs text-muted-foreground">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {cats.length > 0 && (
        <section className="space-y-5">
          <SectionHeader title="Explore por categoria" subtitle="Encontre rapidinho o que você procura" link={false} />
          <div className="flex gap-3 overflow-x-auto pb-2 sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-6">
            {cats.map((c) => (
              <Link
                key={c.id}
                to="/categoria/$slug"
                params={{ slug: c.slug }}
                className="group flex w-32 shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-center shadow-card transition hover:-translate-y-1 hover:border-primary hover:shadow-glow focus-visible:outline-2 focus-visible:outline-primary sm:w-auto"
              >
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary transition group-hover:bg-gradient-primary group-hover:text-primary-foreground">
                  <CategoryIcon name={c.icon} className="h-7 w-7" />
                </span>
                <span className="text-xs font-semibold sm:text-sm">{c.name}</span>
                <CategoryCount id={c.id} />
              </Link>
            ))}
          </div>
        </section>
      )}

      <HomePromotions />

      <Section id="deals" title="Ofertas imperdíveis" subtitle="Os maiores descontos do momento" icon={Flame} highlight />
      <Section id="recommended" title="Achadinhos do Cal recomenda" subtitle="Escolhidos a dedo para você" icon={ThumbsUp} />
      <Section id="viewed" title="Mais procurados" subtitle="O que todo mundo está olhando" icon={Eye} />
      <Section id="clicked" title="Mais clicados" subtitle="Os favoritos da galera" icon={MousePointerClick} highlight />
      <Section id="bestsellers" title="Mais vendidos" subtitle="Sucesso garantido" icon={Trophy} />
      <Section id="new" title="Novidades" subtitle="Acabaram de chegar" icon={Sparkles} />

      {!isLoading && !newest?.length && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-dark p-10 text-center text-secondary-foreground">
          <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
          <p className="relative font-display text-2xl font-bold">Os primeiros achadinhos estão chegando!</p>
          <p className="relative mt-2 text-sm opacity-80">Volte em breve para conferir as melhores ofertas.</p>
        </div>
      )}
    </div>
  );
}
