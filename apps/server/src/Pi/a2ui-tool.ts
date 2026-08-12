import { defineTool } from "@earendil-works/pi-coding-agent";
import type { A2uiToolDetails, JsonValue } from "@pi/shared";
import { Type } from "typebox";
const Message = Type.Record(Type.String(), Type.Unknown());
export const renderA2uiTool = defineTool({
  name: "render_a2ui",
  label: "Render A2UI",
  description: "Render or update an A2UI v0.9 ECharts surface in the conversation.",
  promptSnippet: "Render charts with the render_a2ui tool instead of Markdown or code fences.",
  promptGuidelines: [
    "Use render_a2ui for charts. Never emit A2UI as Markdown or a code fence.",
    "Use A2UI v0.9 messages and the EChart component with a valid ECharts option.",
  ],
  parameters: Type.Object({ surfaceId: Type.String({ minLength: 1 }), messages: Type.Array(Message, { minItems: 1 }) }),
  execute: async (_id, params) => {
    validate(params.surfaceId, params.messages);
    const details: A2uiToolDetails = {
      kind: "a2ui.surface",
      protocolVersion: "v0.9",
      surfaceId: params.surfaceId,
      messages: params.messages as JsonValue[],
    };
    return {
      content: [{ type: "text", text: `A2UI surface ${params.surfaceId} accepted (${params.messages.length} messages).` }],
      details,
    };
  },
});
function validate(surfaceId: string, messages: Record<string, unknown>[]): void {
  let hasChart = false;
  for (const message of messages) {
    if (message.version !== "v0.9" && message.version !== "v0.9.1") throw new Error("Only A2UI v0.9/v0.9.1 messages are supported");
    const body = message.createSurface ?? message.updateComponents ?? message.updateDataModel ?? message.deleteSurface;
    if (!body || typeof body !== "object" || Array.isArray(body) || (body as Record<string, unknown>).surfaceId !== surfaceId)
      throw new Error(`Every A2UI message must target surfaceId ${surfaceId}`);
    const components = (message.updateComponents as Record<string, unknown> | undefined)?.components;
    if (Array.isArray(components))
      hasChart ||= components.some(
        (component) =>
          Boolean(component) &&
          typeof component === "object" &&
          ((component as Record<string, unknown>).component === "EChart" ||
            Boolean(((component as Record<string, unknown>).component as Record<string, unknown> | undefined)?.EChart)),
      );
  }
  if (!hasChart) throw new Error("A2UI surface must contain an EChart component");
}
