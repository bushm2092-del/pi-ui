import { describe, expect, it } from "vitest";
import { parseA2uiJsonl, parseA2uiMessages, resolveJsonPointer } from "./a2ui-protocol";

describe("A2UI v0.9 protocol", () => {
  it("builds an EChart surface from JSONL messages", () => {
    const document = parseA2uiJsonl([
      JSON.stringify({ version: "v0.9", createSurface: { surfaceId: "sales", catalogId: "https://pi.local/a2ui/charts.json" } }),
      JSON.stringify({ version: "v0.9", updateComponents: { surfaceId: "sales", components: [
        { id: "root", component: "EChart", option: { path: "/chart" }, height: 280 },
      ] } }),
      JSON.stringify({ version: "v0.9", updateDataModel: { surfaceId: "sales", path: "/chart", value: {
        xAxis: { type: "category", data: ["Mon", "Tue"] },
        yAxis: { type: "value" },
        series: [{ type: "bar", data: [12, 20] }],
      } } }),
    ].join("\n"));

    expect(document.errors).toEqual([]);
    expect(document.surfaces[0]?.components.get("root")).toMatchObject({
      component: "EChart",
      height: 280,
    });
    expect(resolveJsonPointer(document.surfaces[0]?.dataModel, "/chart/series/0/data/1")).toBe(20);
  });

  it("supports the wrapped v0.8-style component shape used by early clients", () => {
    const document = parseA2uiJsonl(JSON.stringify({
      version: "v0.9.1",
      updateComponents: {
        surfaceId: "chart",
        components: [{ id: "root", component: { EChart: { option: { series: [] } } } }],
      },
    }));
    expect(document.surfaces[0]?.components.get("root")?.component).toBe("EChart");
  });

  it("accepts structured tool messages without a Markdown transport", () => {
    const document = parseA2uiMessages([{
      version: "v0.9",
      updateComponents: {
        surfaceId: "chart",
        components: [{ id: "root", component: "EChart", option: { series: [] } }],
      },
    }]);
    expect(document.surfaces[0]?.components.get("root")?.component).toBe("EChart");
  });
});
