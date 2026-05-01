import type { TimePoint } from "../types";

export const computeStats = (points: TimePoint[]) => {
  if (!points.length) {
    return { max: 0, min: 0, avg: 0 };
  }
  const values = points.map((item) => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = values.reduce((sum, n) => sum + n, 0) / values.length;
  return { max, min, avg };
};
