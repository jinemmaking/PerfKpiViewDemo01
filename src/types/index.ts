export type MetricType = "in_traffic" | "out_traffic" | "in_usage" | "out_usage";
export type ModeType = "original" | "sum" | "avg";
export type QuickRangeType = "1h" | "6h" | "24h" | "custom";

export interface DeviceTreeNode {
  id: string;
  label: string;
  type: "org" | "dc" | "room" | "device" | "port";
  children?: DeviceTreeNode[];
}

export interface TimePoint {
  timestamp: string;
  value: number;
}

export interface PortSeries {
  portId: string;
  portName: string;
  points: TimePoint[];
}

export interface PerformanceQuery {
  portIds: string[];
  metric: MetricType;
  mode: ModeType;
  timeRange: [string, string];
}

export interface StatsRow {
  name: string;
  max: number;
  min: number;
  avg: number;
}

export interface SavedView {
  id: string;
  name: string;
  portIds: string[];
  metric: MetricType;
  mode: ModeType;
}
