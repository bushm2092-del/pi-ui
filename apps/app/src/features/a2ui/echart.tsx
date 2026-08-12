import { useEffect, useRef } from "react";
import type { EChartsOption, EChartsType } from "echarts";

export function A2uiEChart({ option, height = 320 }: { option: EChartsOption; height?: number }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    let disposed = false;
    let resizeObserver: ResizeObserver | undefined;
    void import("echarts").then((echarts) => {
      if (disposed || !elementRef.current) return;
      const chart = echarts.init(elementRef.current, undefined, { renderer: "canvas" });
      chartRef.current = chart;
      chart.setOption(option, { notMerge: true });
      resizeObserver = new ResizeObserver(() => chart.resize());
      resizeObserver.observe(elementRef.current);
    });
    return () => {
      disposed = true;
      resizeObserver?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return <div ref={elementRef} className="pi-a2ui-chart" style={{ height: Math.min(Math.max(height, 180), 640) }} />;
}
