<template>
  <main class="min-h-screen bg-slate-100">
    <header class="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
      <div class="flex items-center gap-3">
        <span class="rounded bg-primary px-2 py-1 text-xs font-semibold text-white">LOGO</span>
        <h1 class="text-lg font-semibold text-slate-800">企业级性能数据展示台</h1>
      </div>
      <div class="flex items-center gap-2">
        <el-select
          v-model="store.activeSavedViewId"
          placeholder="已存视图"
          class="w-48"
          @change="onLoadSavedView"
        >
          <el-option
            v-for="view in store.savedViews"
            :key="view.id"
            :label="view.name"
            :value="view.id"
          />
        </el-select>
        <el-button type="primary" plain @click="onSaveCurrentView">保存当前</el-button>
      </div>
    </header>

    <section class="flex h-[calc(100vh-61px)]">
      <aside class="w-[280px] overflow-auto border-r border-slate-200 bg-white p-4">
        <ResourceTree />
      </aside>
      <section class="flex-1 overflow-auto p-4">
        <ControlPanel @query="fetchData" />
        <el-empty v-if="!store.selectedCount" description="请选择端口后查询数据" />
        <template v-else>
          <PerformanceChart
            :series="series"
            :size="store.chartSize"
            :selected-count="store.selectedCount"
            :loading="loading"
          />
          <StatsTable :rows="statsRows" />
        </template>
      </section>
    </section>
  </main>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { ElMessage, ElMessageBox } from "element-plus";
import { computed, onMounted, ref, watch } from "vue";
import ControlPanel from "../components/ControlPanel.vue";
import PerformanceChart from "../components/PerformanceChart.vue";
import ResourceTree from "../components/ResourceTree.vue";
import StatsTable from "../components/StatsTable.vue";
import { fetchPerformanceData } from "../api/mockService";
import { useDashboardStore } from "../stores/dashboard";
import type { PortSeries, StatsRow } from "../types";
import { computeStats } from "../utils/stats";

const store = useDashboardStore();
const loading = ref(false);
const series = ref<PortSeries[]>([]);

const statsRows = computed<StatsRow[]>(() =>
  series.value.map((item) => {
    const stats = computeStats(item.points);
    return {
      name: item.portName,
      max: stats.max,
      min: stats.min,
      avg: stats.avg,
    };
  }),
);

const getRangeText = (): [string, string] => {
  const [from, to] = store.customRange;
  return [dayjs(from).format("YYYY-MM-DD HH:mm"), dayjs(to).format("YYYY-MM-DD HH:mm")];
};

const fetchData = async () => {
  if (!store.selectedCount) {
    series.value = [];
    return;
  }
  loading.value = true;
  series.value = [];
  try {
    series.value = await fetchPerformanceData({
      portIds: store.selectedPortIds,
      metric: store.metric,
      mode: store.mode,
      timeRange: getRangeText(),
    });
  } finally {
    loading.value = false;
  }
};

const onSaveCurrentView = async () => {
  if (!store.selectedCount) {
    ElMessage.warning("请先选择端口后再保存");
    return;
  }
  const name = await ElMessageBox.prompt("请输入视图名称", "保存当前视图", {
    confirmButtonText: "保存",
    cancelButtonText: "取消",
    inputPlaceholder: "例如：核心链路",
  }).catch(() => null);

  const trimmed = name?.value?.trim();
  if (!trimmed) return;
  store.addSavedView(trimmed);
  ElMessage.success("视图已保存");
};

const onLoadSavedView = (id: string) => {
  store.applySavedView(id);
  fetchData();
};

watch(
  () => [store.metric, store.mode],
  () => {
    fetchData();
  },
);

onMounted(() => {
  store.loadSavedViews();
});
</script>
