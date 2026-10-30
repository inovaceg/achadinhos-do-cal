import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAdminStatistics } from "@/lib/admin.functions";
import { customDayRange, localDayRange, statisticsCsv, type ProductStatistics } from "@/lib/statistics";

type StatisticsRange = "all" | "today" | "7days" | "30days" | "custom";

export function AdminStatistics({ userId, active }: { userId: string; active: boolean }) {
  const [range, setRange] = useState<StatisticsRange>("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"clicks" | "views">("clicks");
  const [asOf, setAsOf] = useState(() => new Date());
  const bounds = useMemo(() => {
    if (range === "all") return { start: null, end: null };
    if (range === "today") return localDayRange(asOf);
    if (range === "7days") return localDayRange(asOf, 7);
    if (range === "30days") return localDayRange(asOf, 30);
    return customDayRange(from, to);
  }, [range, from, to, asOf]);
  const query = useQuery({
    queryKey: ["admin", userId, "statistics", bounds],
    queryFn: () => getAdminStatistics({ data: bounds! }),
    enabled: active && !!bounds,
    staleTime: 30_000,
  });
  const rows = query.data ?? [];
  const filtered = rows
    .filter((row) => `${row.name} ${row.store}`.toLocaleLowerCase().includes(search.toLocaleLowerCase()))
    .sort((a, b) => b[sort] - a[sort]);
  const top = (key: "clicks" | "views", count: number) =>
    [...rows].filter((row) => row[key] > 0).sort((a, b) => b[key] - a[key]).slice(0, count);
  const period = bounds
    ? bounds.start
      ? `${new Date(bounds.start).toLocaleDateString("pt-BR")} — ${new Date(Date.parse(bounds.end!) - 1).toLocaleDateString("pt-BR")}`
      : "Todos os períodos"
    : "Selecione datas válidas";

  const refresh = () => {
    if (!active || !bounds) return;
    const nextAsOf = new Date();
    setAsOf(nextAsOf);
    if (range === "all" || range === "custom") {
      void query.refetch();
      return;
    }
    const nextBounds = localDayRange(nextAsOf, range === "today" ? 1 : range === "7days" ? 7 : 30);
    if (nextBounds.start === bounds?.start && nextBounds.end === bounds?.end) void query.refetch();
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([statisticsCsv(filtered, period)], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `estatisticas-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="min-w-0 space-y-5 rounded-2xl border bg-card p-4 sm:p-6">
      <h2 className="text-2xl font-bold">Estatísticas</h2>
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">Período
          <select className="mt-1 block h-10 rounded-md border bg-background px-3" value={range} onChange={(event) => setRange(event.target.value as StatisticsRange)}>
            <option value="all">Todos</option><option value="today">Hoje</option><option value="7days">7 dias</option><option value="30days">30 dias</option><option value="custom">Personalizado</option>
          </select>
        </label>
        {range === "custom" && <>
          <label className="text-sm">De<Input type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
          <label className="text-sm">Até<Input type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label>
        </>}
        <Button variant="outline" disabled={!bounds || query.isFetching} onClick={refresh}>Atualizar</Button>
        <Button disabled={!active || !bounds || !query.data || query.isFetching || query.isError} onClick={download}>Exportar CSV</Button>
      </div>
      {!bounds && <p role="alert" className="text-sm text-destructive">Informe datas válidas para o período personalizado.</p>}
      {active && bounds && query.isPending && <p>Carregando estatísticas…</p>}
      {query.isError && <div role="alert">Não foi possível carregar o relatório. <Button variant="outline" onClick={refresh}>Tentar novamente</Button></div>}
      {query.data && <>
        <p className="text-sm text-muted-foreground">Período: {period}. As datas são exibidas no horário local; o último dia selecionado é inclusivo. Visualizações são aberturas de detalhes; cliques são acionamentos dos botões de oferta — não representam compras, pessoas únicas ou conversões.</p>
        <div className="grid min-w-0 gap-3 sm:grid-cols-2">
          {([["views", "Mais visualizações", "Nenhuma visualização no período."], ["clicks", "Mais cliques", "Nenhum clique no período."]] as const).map(([key, title, empty]) => {
            const leaders = top(key, 5);
            return <article key={key} className="min-w-0 rounded-xl border p-4"><h3 className="font-semibold">{title}</h3>{leaders.map((row) => <p key={row.product_id} className="flex min-w-0 justify-between gap-2"><span className="min-w-0 break-words">{row.name}</span><span className="shrink-0 text-muted-foreground">{row[key]}</span></p>)}{!leaders.length && <p className="text-sm text-muted-foreground">{empty}</p>}</article>;
          })}
        </div>
        <p className="font-semibold">Totais do período: {rows.reduce((total, row) => total + row.views, 0)} visualizações · {rows.reduce((total, row) => total + row.clicks, 0)} cliques</p>
        <div className="flex flex-wrap gap-3">
          <Input className="max-w-sm" aria-label="Buscar produto ou loja" placeholder="Buscar produto ou loja" value={search} onChange={(event) => setSearch(event.target.value)} />
          <label className="flex items-center gap-2 text-sm">Ordenar por
            <select className="h-10 rounded-md border bg-background px-2" value={sort} onChange={(event) => setSort(event.target.value as "clicks" | "views")}><option value="clicks">Cliques</option><option value="views">Visualizações</option></select>
          </label>
        </div>
        <div className="w-full overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead><tr><th className="p-2">Produto</th><th>Loja</th><th>Status</th><th>Visualizações</th><th>Cliques</th></tr></thead><tbody>{filtered.map((row: ProductStatistics) => <tr key={row.product_id} className="border-t"><td className="p-2">{row.name}</td><td>{row.store}</td><td>{row.active ? "Ativo" : "Inativo"}</td><td>{row.views}</td><td>{row.clicks}</td></tr>)}</tbody></table>{!filtered.length && <p className="p-4 text-sm text-muted-foreground">{rows.length ? "Nenhum produto corresponde à busca." : "Nenhum produto encontrado no relatório."}</p>}</div>
        <p className="text-xs text-muted-foreground">Produtos excluídos e seus eventos em cascata não aparecem neste relatório.</p>
      </>}
    </section>
  );
}
