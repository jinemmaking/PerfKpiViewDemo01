<template>
  <section class="flex h-full flex-col gap-3">
    <el-input v-model="keyword" placeholder="搜索设备/端口" clearable />
    <el-tree-v2
      ref="treeRef"
      :data="deviceTree"
      :props="treeProps"
      show-checkbox
      node-key="id"
      :height="420"
      :filter-method="filterNode"
      @check="onCheck"
    />
    <div class="rounded-md border border-slate-200 bg-white p-3">
      <header class="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
        <span>已选端口 ({{ selectedTags.length }}/10)</span>
        <el-button link type="primary" @click="clearAll">清空全部</el-button>
      </header>
      <div class="flex min-h-10 flex-wrap gap-2">
        <el-tag
          v-for="tag in selectedTags"
          :key="tag.id"
          closable
          @close="removeTag(tag.id)"
        >
          {{ tag.name }}
        </el-tag>
        <span v-if="!selectedTags.length" class="text-xs text-slate-400">尚未选择端口</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { computed, ref, watch } from "vue";
import { deviceTree, buildPortMap } from "../data/deviceTree";
import { useDashboardStore } from "../stores/dashboard";
import type { DeviceTreeNode } from "../types";

interface TreeV2Expose {
  filter: (value: string) => void;
  setCheckedKeys: (keys: string[]) => void;
  getCheckedKeys: (leafOnly?: boolean) => string[];
}

const treeRef = ref<TreeV2Expose>();
const keyword = ref("");
const dashboardStore = useDashboardStore();
const portMap = buildPortMap(deviceTree);

const treeProps = {
  value: "id",
  label: "label",
  children: "children",
};

const filterNode = (query: string, node: DeviceTreeNode): boolean => {
  if (!query) return true;
  return node.label.toLowerCase().includes(query.toLowerCase());
};

watch(keyword, (value) => {
  treeRef.value?.filter(value);
});

watch(
  () => dashboardStore.selectedPortIds,
  (ids) => {
    treeRef.value?.setCheckedKeys(ids);
  },
  { deep: true, immediate: true },
);

const selectedTags = computed(() =>
  dashboardStore.selectedPortIds.map((id) => ({
    id,
    name: portMap.get(id) ?? id,
  })),
);

const onCheck = (_: DeviceTreeNode, checkedInfo: { checkedKeys: unknown[] }) => {
  const checkedKeys = checkedInfo.checkedKeys as string[];
  const portKeys = checkedKeys.filter((key) => portMap.has(key));
  if (portKeys.length > 10) {
    ElMessage.warning("最多支持10个端口叠加");
    treeRef.value?.setCheckedKeys(dashboardStore.selectedPortIds);
    return;
  }
  dashboardStore.replaceSelectedPorts(portKeys);
};

const removeTag = (id: string) => {
  const next = dashboardStore.selectedPortIds.filter((item) => item !== id);
  dashboardStore.replaceSelectedPorts(next);
};

const clearAll = () => {
  dashboardStore.replaceSelectedPorts([]);
};
</script>
