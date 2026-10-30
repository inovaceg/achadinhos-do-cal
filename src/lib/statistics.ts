import { z } from "zod";

export const statisticsRangeSchema = z.object({
  start: z.string().datetime({ offset: true }).nullable(),
  end: z.string().datetime({ offset: true }).nullable(),
}).refine(({ start, end }) => (start === null) === (end === null) && (!start || !end || Date.parse(start) < Date.parse(end)), "Período inválido.");

export const productStatisticsSchema = z.array(z.object({
  product_id: z.string().uuid(), name: z.string(), slug: z.string(), image_url: z.string().nullable(), store: z.string(), active: z.boolean(), clicks: z.number().int().nonnegative(), views: z.number().int().nonnegative(),
}));
export type ProductStatistics = z.infer<typeof productStatisticsSchema>[number];

export function localDayRange(date: Date, days = 1) {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate() - days + 1);
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function customDayRange(from: string, to: string) {
  const validDay = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
    const [year, month, day] = value.split("-").map(Number);
    const date = new Date(year!, month! - 1, day!);
    return date.getFullYear() === year && date.getMonth() === month! - 1 && date.getDate() === day ? date : null;
  };
  const first = validDay(from);
  const last = validDay(to);
  if (!first || !last || first > last) return null;
  const end = new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1);
  return { start: first.toISOString(), end: end.toISOString() };
}

function csvCell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && /^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}
export function statisticsCsv(rows: ProductStatistics[], period: string) {
  const lines = [["Período", period], ["Nome", "Loja", "Status", "Visualizações", "Cliques"], ...rows.map((row) => [row.name, row.store, row.active ? "Ativo" : "Inativo", row.views, row.clicks])];
  return `\uFEFF${lines.map((line) => line.map(csvCell).join(";")).join("\r\n")}`;
}
