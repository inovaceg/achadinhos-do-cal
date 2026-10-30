import { describe, expect, it } from "vitest";
import { customDayRange, localDayRange, statisticsCsv, statisticsRangeSchema, type ProductStatistics } from "@/lib/statistics";

const row: ProductStatistics = { product_id: "00000000-0000-4000-8000-000000000001", name: '=cmd;"run', slug: "item", image_url: null, store: "@loja", active: true, clicks: 4, views: 9 };
describe("statistics helpers", () => {
  it("validates paired ISO date bounds and ordering", () => {
    expect(statisticsRangeSchema.safeParse({ start: null, end: null }).success).toBe(true);
    expect(statisticsRangeSchema.safeParse({ start: "2025-01-02T00:00:00Z", end: null }).success).toBe(false);
    expect(statisticsRangeSchema.safeParse({ start: "2025-01-02T00:00:00Z", end: "2025-01-01T00:00:00Z" }).success).toBe(false);
  });
  it("creates complete local-day boundaries", () => {
    const date = new Date(2025, 2, 8, 14);
    const bounds = localDayRange(date, 7);
    expect(new Date(bounds.start).getHours()).toBe(0);
    expect(new Date(bounds.end).getDate()).toBe(9);
  });
  it("validates custom calendar days and includes the final day", () => {
    const bounds = customDayRange("2025-02-28", "2025-03-01");
    expect(bounds).not.toBeNull();
    expect(new Date(bounds!.start).getDate()).toBe(28);
    expect(new Date(bounds!.end).getDate()).toBe(2);
    expect(customDayRange("2025-02-29", "2025-03-01")).toBeNull();
    expect(customDayRange("2024-02-29", "2024-02-29")).not.toBeNull();
    expect(customDayRange("2025-03-02", "2025-03-01")).toBeNull();
    expect(customDayRange("2025-2-01", "2025-03-01")).toBeNull();
  });
  it("escapes CSV and neutralizes formulas", () => {
    const csv = statisticsCsv([row], "Todos");
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(csv).toContain("\"'=cmd;\"\"run\"");
    expect(csv).toContain("\"'@loja\"");
    expect(csv).toContain('"Nome";"Loja";"Status";"Visualizações";"Cliques"');
  });
});
