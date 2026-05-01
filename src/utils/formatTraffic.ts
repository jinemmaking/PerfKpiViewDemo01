const units = ["bps", "Kbps", "Mbps", "Gbps", "Tbps"];

export const formatTraffic = (value: number): string => {
  if (!Number.isFinite(value)) return "0 bps";
  let current = Math.max(value, 0);
  let idx = 0;
  while (current >= 1024 && idx < units.length - 1) {
    current /= 1024;
    idx += 1;
  }
  return `${current.toFixed(current >= 100 ? 0 : current >= 10 ? 1 : 2)} ${units[idx]}`;
};
