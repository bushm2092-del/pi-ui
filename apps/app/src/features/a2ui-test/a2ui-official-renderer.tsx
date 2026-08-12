import { useEffect, useState } from "react";
import type { EChartsOption } from "echarts";
import { z } from "zod";
import { Catalog, MessageProcessor, type SurfaceModel } from "@a2ui/web_core/v0_9";
import {
  A2uiSurface,
  createComponentImplementation,
  type ReactComponentImplementation,
} from "@a2ui/react/v0_9";
import { A2uiEChart } from "../a2ui/echart";

export const ECHART_CATALOG_ID = "pi://catalog/echarts/v1";

const EChartApi = {
  name: "EChart",
  schema: z.object({
    option: z.record(z.string(), z.unknown()),
    height: z.number().min(180).max(640).optional(),
  }),
};

const EChart = createComponentImplementation(EChartApi, ({ props }) => (
  <A2uiEChart option={props.option as EChartsOption} height={props.height} />
));

export const echartCatalog = new Catalog<ReactComponentImplementation>(
  ECHART_CATALOG_ID,
  [EChart],
);

export function createA2uiTestProcessor() {
  return new MessageProcessor<ReactComponentImplementation>([echartCatalog]);
}

export function A2uiOfficialRenderer({
  processor,
}: {
  processor: MessageProcessor<ReactComponentImplementation>;
}) {
  const [surfaces, setSurfaces] = useState<SurfaceModel<ReactComponentImplementation>[]>(() =>
    [...processor.model.surfacesMap.values()]
  );

  useEffect(() => {
    const sync = () => setSurfaces([...processor.model.surfacesMap.values()]);
    const created = processor.onSurfaceCreated(sync);
    const deleted = processor.onSurfaceDeleted(sync);
    sync();
    return () => {
      created.unsubscribe();
      deleted.unsubscribe();
    };
  }, [processor]);

  if (!surfaces.length) {
    return <div className="pi-a2ui-status">正在接收 A2UI 图表...</div>;
  }

  return (
    <div className="pi-a2ui-document">
      {surfaces.map((surface) => (
        <section className="pi-a2ui-surface" data-a2ui-surface={surface.id} key={surface.id}>
          <A2uiSurface surface={surface} />
        </section>
      ))}
    </div>
  );
}
