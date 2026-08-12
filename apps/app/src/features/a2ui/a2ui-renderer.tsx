import type { EChartsOption } from "echarts";
import { A2uiEChart } from "./echart";
import { parseA2uiMessages, resolveJsonPointer, type A2uiComponent } from "./a2ui-protocol";

export function A2uiRenderer({ messages }: { messages: unknown[] }) {
  const document = parseA2uiMessages(messages);
  if (!document.surfaces.length) {
    return <div className="pi-a2ui-status">正在接收 A2UI 图表...</div>;
  }
  return (
    <div className="pi-a2ui-document">
      {document.surfaces.map((surface) => (
        <section className="pi-a2ui-surface" data-a2ui-surface={surface.id} key={surface.id}>
          {[...surface.components.values()].map((component) => (
            <A2uiComponentView component={component} dataModel={surface.dataModel} key={component.id} />
          ))}
        </section>
      ))}
      {document.errors.length ? <p className="pi-a2ui-error">{document.errors[0]}</p> : null}
    </div>
  );
}

function A2uiComponentView({ component, dataModel }: { component: A2uiComponent; dataModel: unknown }) {
  if (component.component !== "EChart") return null;
  const bound = readPath(component.option) ?? readPath(component.options);
  const option = bound ? resolveJsonPointer(dataModel, bound) : component.option ?? component.options;
  if (!isRecord(option)) return <div className="pi-a2ui-status">EChart 缺少有效的 option</div>;
  const height = typeof component.height === "number" ? component.height : undefined;
  return <A2uiEChart option={option as EChartsOption} height={height} />;
}

function readPath(value: unknown): string | undefined {
  return isRecord(value) && typeof value.path === "string" ? value.path : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
