import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { categoriesQuery, searchProductsQuery, storesQuery, type SearchParams } from "@/lib/queries";
import { GridSkeleton, ProductGrid } from "./ProductCard";

export function ProductBrowser({
  params,
  onChange,
  lockCategory,
}: {
  params: SearchParams;
  onChange: (p: SearchParams) => void;
  lockCategory?: boolean;
}) {
  const { data, isLoading, error } = useQuery(searchProductsQuery(params));
  const { data: cats = [] } = useQuery(categoriesQuery);
  const { data: stores = [] } = useQuery(storesQuery);
  const [showFilters, setShowFilters] = useState(false);
  const set = (patch: Partial<SearchParams>) => onChange({ ...params, ...patch });
  const sel = "h-10 rounded-xl border border-input bg-card px-3 text-sm";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => setShowFilters((v) => !v)} className="flex h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm font-semibold md:hidden">
          <SlidersHorizontal className="h-4 w-4" /> Filtros
        </button>
        <div className={`${showFilters ? "flex" : "hidden"} w-full flex-wrap gap-2 md:flex md:w-auto`}>
          {!lockCategory && (
            <select aria-label="Categoria" className={sel} value={params.categoria ?? ""} onChange={(e) => set({ categoria: e.target.value || undefined })}>
              <option value="">Todas as categorias</option>
              {cats.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          )}
          <select aria-label="Loja" className={sel} value={params.loja ?? ""} onChange={(e) => set({ loja: e.target.value || undefined })}>
            <option value="">Todas as lojas</option>
            {stores.map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
          <input aria-label="Preço mínimo" type="number" min={0} placeholder="R$ mín" className={`${sel} w-24`} value={params.min ?? ""} onChange={(e) => set({ min: e.target.value ? Number(e.target.value) : undefined })} />
          <input aria-label="Preço máximo" type="number" min={0} placeholder="R$ máx" className={`${sel} w-24`} value={params.max ?? ""} onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })} />
          <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm">
            <input type="checkbox" checked={!!params.desconto} onChange={(e) => set({ desconto: e.target.checked || undefined })} className="accent-primary" /> Com desconto
          </label>
          <label className="flex h-10 items-center gap-2 rounded-xl border border-input bg-card px-3 text-sm">
            <input type="checkbox" checked={!!params.recentes} onChange={(e) => set({ recentes: e.target.checked || undefined })} className="accent-primary" /> Últimos 7 dias
          </label>
        </div>
        <select aria-label="Ordenar" className={`${sel} ml-auto`} value={params.ordem ?? "recentes"} onChange={(e) => set({ ordem: e.target.value as SearchParams["ordem"] })}>
          <option value="recentes">Mais recentes</option>
          <option value="menor-preco">Menor preço</option>
          <option value="maior-desconto">Maior desconto</option>
          <option value="mais-clicados">Mais clicados</option>
        </select>
      </div>
      {error ? (
        <p className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive">Não foi possível carregar as ofertas. Tente novamente.</p>
      ) : isLoading ? (
        <GridSkeleton n={10} />
      ) : data?.length ? (
        <>
          <p className="text-sm text-muted-foreground">{data.length} achadinho(s) encontrado(s)</p>
          <ProductGrid products={data} />
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Nenhum produto encontrado com esses filtros.
        </div>
      )}
    </div>
  );
}

export function parseSearch(s: Record<string, unknown>): SearchParams {
  const num = (v: unknown) => (v === undefined || v === "" || Number.isNaN(Number(v)) ? undefined : Number(v));
  const ordens = ["menor-preco", "maior-desconto", "recentes", "mais-clicados"];
  return {
    q: typeof s.q === "string" && s.q ? s.q.slice(0, 100) : undefined,
    categoria: typeof s.categoria === "string" && s.categoria ? s.categoria : undefined,
    loja: typeof s.loja === "string" && s.loja ? s.loja : undefined,
    min: num(s.min),
    max: num(s.max),
    desconto: s.desconto === true || s.desconto === "true" ? true : undefined,
    recentes: s.recentes === true || s.recentes === "true" ? true : undefined,
    ordem: ordens.includes(s.ordem as string) ? (s.ordem as SearchParams["ordem"]) : undefined,
  };
}
