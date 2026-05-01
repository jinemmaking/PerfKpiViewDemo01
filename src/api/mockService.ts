import dayjs from "dayjs";
import { sumBy } from "lodash-es";
import type { PerformanceQuery, PortSeries, TimePoint } from "../types";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const metricFactorMap = {
  in_traffic: 1,
  out_traffic: 0.92,
  in_usage: 0.65,
  out_usage: 0.54,
} as const;

const hashSeed = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash % 1000);
};

const buildSeries = (
  portId: string,
  metric: PerformanceQuery["metric"],
  start: string,
  end: string,
): PortSeries => {
  const from = dayjs(start);
  const to = dayjs(end);
  const steps = Math.max(1, to.diff(from, "minute"));
  const metricFactor = metricFactorMap[metric];
  const seed = hashSeed(`${portId}-${metric}`);
  const points: TimePoint[] = Array.from({ length: steps + 1 }).map((_, idx) => {
    const ts = from.add(idx, "minute");
    const wave = Math.sin((idx + seed) / 8) * 0.35 + 0.65;
    const burst = Math.cos((idx + seed) / 17) * 0.2 + 0.8;
    const jitter = ((seed + idx * 13) % 20) / 100;
    const value = (wave + burst + jitter) * metricFactor * 28 * 1024 * 1024;
    return {
      timestamp: ts.format("YYYY-MM-DD HH:mm"),
      value,
    };
  });

  return {
    portId,
    portName: portId.replace(/.*-/, "").toUpperCase(),
    points,
  };
};

const aggregateByMode = (series: PortSeries[], mode: PerformanceQuery["mode"]): PortSeries[] => {
  if (mode === "original" || series.length <= 1) {
    return series;
  }
  const base = series[0];
  const points = base.points.map((point, idx) => {
    const sum = sumBy(series, (item) => item.points[idx]?.value ?? 0);
    return {
      timestamp: point.timestamp,
      value: mode === "avg" ? sum / series.length : sum,
    };
  });
  return [
    {
      portId: mode === "sum" ? "aggregate-sum" : "aggregate-avg",
      portName: mode === "sum" ? "已选端口汇总(Sum)" : "已选端口平均(Avg)",
      points,
    },
  ];
};

export const fetchPerformanceData = async (query: PerformanceQuery): Promise<PortSeries[]> => {
  await wait(500);
  if (!query.portIds.length) {
    return [];
  }
  const series = query.portIds.map((portId) =>
    buildSeries(portId, query.metric, query.timeRange[0], query.timeRange[1]),
  );
  return aggregateByMode(series, query.mode);
};
