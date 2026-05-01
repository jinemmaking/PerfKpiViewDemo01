import type { DeviceTreeNode } from "../types";

const makePorts = (deviceId: string, start: number): DeviceTreeNode[] =>
  Array.from({ length: 6 }).map((_, idx) => ({
    id: `${deviceId}-p${start + idx}`,
    label: `Port-${String(start + idx).padStart(2, "0")}`,
    type: "port",
  }));

const makeDevice = (roomId: string, index: number): DeviceTreeNode => ({
  id: `${roomId}-dev${index}`,
  label: `H-HGB13${String.fromCharCode(64 + index)}-PN${index}`,
  type: "device",
  children: makePorts(`${roomId}-dev${index}`, 1),
});

const makeRoom = (dcId: string, index: number): DeviceTreeNode => ({
  id: `${dcId}-room${index}`,
  label: `核心机房-${String(index).padStart(2, "0")}`,
  type: "room",
  children: [makeDevice(`${dcId}-room${index}`, 1), makeDevice(`${dcId}-room${index}`, 2)],
});

const makeDatacenter = (orgId: string, index: number): DeviceTreeNode => ({
  id: `${orgId}-dc${index}`,
  label: `数据中心本部-${String(index).padStart(2, "0")}`,
  type: "dc",
  children: [makeRoom(`${orgId}-dc${index}`, 1), makeRoom(`${orgId}-dc${index}`, 2)],
});

export const deviceTree: DeviceTreeNode[] = [
  {
    id: "org-main",
    label: "组织机构总部",
    type: "org",
    children: Array.from({ length: 5 }).map((_, i) => makeDatacenter("org-main", i + 1)),
  },
];

export const buildPortMap = (nodes: DeviceTreeNode[]): Map<string, string> => {
  const map = new Map<string, string>();
  const walk = (items: DeviceTreeNode[]): void => {
    items.forEach((item) => {
      if (item.type === "port") {
        map.set(item.id, item.label);
      }
      if (item.children?.length) {
        walk(item.children);
      }
    });
  };
  walk(nodes);
  return map;
};
