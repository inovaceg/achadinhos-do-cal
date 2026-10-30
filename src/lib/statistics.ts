import { z } from "zod";

const daySchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
});
export const statisticsRangeSchema = z.object({ start: z.string().datetime({ offset: true }).nullable(), end: z.string().datetime({ offset: true }).nullable() }).refine(({ start, end }) => (start === null) === (end === null) && (!start || !end || Date.parse(start) < Date.parse(end)), "Período inválido.");
export const productStatisticsSchema = z.array(z.object({ product_id: z.string().uuid(), name: z.string(), slug: z.string(), image_url: z.string().nullable(), store: z.string(), active: z.boolean(), clicks: z.number().int().nonnegative(), views: z.number().int().nonnegative() }));
export const statisticsMetadataSchema = z.object({ categories: z.array(z.object({ id: z.string().uuid(), name: z.string() })), stores: z.array(z.object({ id: z.string().uuid(), name: z.string().nullable() })) });
export const statisticsSeriesSchema = z.array(z.object({ date: daySchema, product_id: z.string().uuid(), views: z.number().int().nonnegative(), clicks: z.number().int().nonnegative() }));
export const statisticsResponseSchema = z.object({ rows: z.array(productStatisticsSchema.element.extend({ category_id: z.string().uuid().nullable(), category_name: z.string().nullable(), store_id: z.string().uuid().nullable(), store_name: z.string().nullable() })), ...statisticsMetadataSchema.shape, series: statisticsSeriesSchema, snapshot: z.string().datetime({ offset: true }), undatedCount: z.number().int().nonnegative() });
export type ProductStatistics = z.infer<typeof statisticsResponseSchema>["rows"][number];
export type StatisticsSeries = z.infer<typeof statisticsSeriesSchema>[number];
export type StatisticsResponse = z.infer<typeof statisticsResponseSchema>;
export const ctr = (clicks: number, views: number) => views === 0 ? null : clicks / views * 100;
export function filterStatistics(rows: ProductStatistics[], filters: { search: string; category: string; store: string; product: string }) {
  return rows.filter((row) => (!filters.search || `${row.name} ${row.store}`.toLocaleLowerCase().includes(filters.search.toLocaleLowerCase())) && (!filters.category || (filters.category === "none" ? !row.category_id : row.category_id === filters.category)) && (!filters.store || (filters.store === "none" ? !row.store_id : row.store_id === filters.store)) && (!filters.product || row.product_id === filters.product));
}
export function sortStatistics(rows: ProductStatistics[], key: "views" | "clicks" | "ctr", ascending: boolean) {
  return [...rows].sort((a, b) => {
    const av = key === "ctr" ? ctr(a.clicks, a.views) : a[key];
    const bv = key === "ctr" ? ctr(b.clicks, b.views) : b[key];
    if (av === null) return bv === null ? a.name.localeCompare(b.name) : 1;
    if (bv === null) return -1;
    return (ascending ? 1 : -1) * (av - bv) || a.name.localeCompare(b.name);
  });
}
export function lowPerformers(rows: ProductStatistics[]) { return rows.filter((row) => row.views > 0 && row.clicks === 0).sort((a, b) => b.views - a.views || a.name.localeCompare(b.name)); }
export function aggregateSeries(series: StatisticsSeries[], rows: ProductStatistics[]) {
  const ids = new Set(rows.map((row) => row.product_id));
  const days = new Map<string, { date: string; views: number; clicks: number }>();
  for (const item of series) { if (!ids.has(item.product_id)) continue; const day = days.get(item.date) ?? { date: item.date, views: 0, clicks: 0 }; day.views += item.views; day.clicks += item.clicks; days.set(item.date, day); }
  return [...days.values()].sort((a, b) => a.date.localeCompare(b.date));
}
export function timeline(series: StatisticsSeries[], rows: ProductStatistics[], bounds: { start: string | null; end: string | null }, snapshot: string) {
  const aggregated = aggregateSeries(series, rows);
  if (!aggregated.length) return { points: [], unit: "diário UTC" as const };
  const snapshotDay = snapshot.slice(0, 10);
  let start = bounds.start ? new Date(bounds.start).toISOString().slice(0, 10) : aggregated[0]!.date;
  let end = bounds.end ? new Date(Date.parse(bounds.end) - 1).toISOString().slice(0, 10) : aggregated.at(-1)!.date;
  if (end > snapshotDay) end = snapshotDay;
  if (start > end) return { points: [], unit: "diário UTC" as const };
  const monthMode = (Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / 86400000 + 1 > 90;
  if (!monthMode) {
    const values = new Map(aggregated.map((item) => [item.date, item]));
    const points = [];
    for (let day = start; day <= end; day = new Date(Date.parse(`${day}T00:00:00Z`) + 86400000).toISOString().slice(0, 10)) points.push(values.get(day) ?? { date: day, views: 0, clicks: 0 });
    return { points, unit: "diário UTC" as const };
  }
  const monthStart = `${start.slice(0, 7)}-01`, monthEnd = `${end.slice(0, 7)}-01`;
  const values = new Map<string, { date: string; views: number; clicks: number }>();
  for (const item of aggregated) { const key = `${item.date.slice(0, 7)}-01`; const value = values.get(key) ?? { date: key, views: 0, clicks: 0 }; value.views += item.views; value.clicks += item.clicks; values.set(key, value); }
  const points = [];
  for (let month = monthStart; month <= monthEnd; month = new Date(Date.parse(`${month}T00:00:00Z`) + 32 * 86400000).toISOString().slice(0, 7) + "-01") points.push(values.get(month) ?? { date: month, views: 0, clicks: 0 });
  return { points, unit: "mensal UTC" as const };
}
export function localDayRange(date: Date, days = 1) { const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days + 1); const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1); return { start: start.toISOString(), end: end.toISOString() }; }
export function customDayRange(from: string, to: string) {
  const validDay = (value: string) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null; const [year, month, day] = value.split("-").map(Number); const date = new Date(year!, month! - 1, day!); return date.getFullYear() === year && date.getMonth() === month! - 1 && date.getDate() === day ? date : null; };
  const first = validDay(from), last = validDay(to); if (!first || !last || first > last) return null; return { start: first.toISOString(), end: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1).toISOString() };
}
function csvCell(value: string | number) { let text = String(value); if (typeof value === "string" && /^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`; return `"${text.replace(/"/g, '""')}"`; }
export function statisticsCsv(rows: ProductStatistics[], period: string) {
  const lines: (string | number)[][] = [["Período", period], ["CTR calculado como cliques totais / visualizações totais × 100; categorias/lojas/produtos refletem filtros selecionados."], ["Nome", "Loja", "Categoria", "Status", "Visualizações", "Cliques", "CTR (%)"], ...rows.map((row) => [row.name, row.store, row.category_name ?? "Sem categoria", row.active ? "Ativo" : "Inativo", row.views, row.clicks, ctr(row.clicks, row.views) ?? "—"])];
  return `\uFEFF${lines.map((line) => line.map(csvCell).join(";")).join("\r\n")}`;
}
