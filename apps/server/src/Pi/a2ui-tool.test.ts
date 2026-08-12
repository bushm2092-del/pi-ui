import { describe, expect, it } from "vitest";
import { renderA2uiTool } from "./a2ui-tool.js";

describe("renderA2uiTool", () => {
  it("returns persistent structured details for a valid chart", async () => {
    const result = await renderA2uiTool.execute(
      "call-1",
      {
        surfaceId: "sales",
        messages: [
          {
            version: "v0.9",
            updateComponents: { surfaceId: "sales", components: [{ id: "root", component: "EChart", option: { series: [] } }] },
          },
        ],
      },
      undefined,
      undefined,
      {} as never,
    );
    expect(result.details).toMatchObject({ kind: "a2ui.surface", surfaceId: "sales" });
  });

  it("fails when messages target another surface", async () => {
    await expect(
      renderA2uiTool.execute(
        "call-1",
        {
          surfaceId: "sales",
          messages: [{ version: "v0.9", updateComponents: { surfaceId: "other", components: [] } }],
        },
        undefined,
        undefined,
        {} as never,
      ),
    ).rejects.toThrow("surfaceId sales");
  });
});
